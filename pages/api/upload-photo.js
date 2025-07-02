import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

// 禁用默认的 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
}

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB 限制
      filter: ({ name, originalFilename, mimetype }) => {
        // 只允许图片文件
        return mimetype && mimetype.includes('image')
      }
    })

    const [fields, files] = await form.parse(req)
    
    if (!files.photo || files.photo.length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有上传照片文件'
      })
    }

    const uploadedFile = Array.isArray(files.photo) ? files.photo[0] : files.photo
    const originalPath = uploadedFile.filepath
    const originalName = uploadedFile.originalFilename
    const fileExtension = path.extname(originalName).toLowerCase()
    
    // 生成唯一文件名
    const uniqueId = uuidv4()
    const fileName = `${uniqueId}${fileExtension}`
    const finalPath = path.join(uploadDir, fileName)
    
    // 使用 sharp 处理图片（压缩和调整大小）
    await sharp(originalPath)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toFile(finalPath.replace(fileExtension, '.jpg'))

    // 删除临时文件
    fs.unlinkSync(originalPath)
    
    // 最终的文件信息
    const processedFileName = fileName.replace(fileExtension, '.jpg')
    const fileUrl = `/uploads/${processedFileName}`
    const fileStats = fs.statSync(path.join(uploadDir, processedFileName))
    
    // 获取图片信息
    const imageInfo = await sharp(path.join(uploadDir, processedFileName)).metadata()
    
    const photoData = {
      id: uniqueId,
      originalName: originalName,
      fileName: processedFileName,
      url: fileUrl,
      size: fileStats.size,
      width: imageInfo.width,
      height: imageInfo.height,
      uploadTime: new Date().toISOString(),
      description: fields.description?.[0] || ''
    }

    // 这里可以将照片信息保存到数据库
    // await savePhotoToDatabase(photoData)

    res.status(200).json({
      success: true,
      data: photoData,
      message: '照片上传成功'
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: '照片上传失败：' + error.message
    })
  }
}

// 如果需要保存到数据库，可以实现这个函数
// async function savePhotoToDatabase(photoData) {
//   // 数据库保存逻辑
// } 