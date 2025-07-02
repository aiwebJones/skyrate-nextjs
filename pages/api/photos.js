import fs from 'fs'
import path from 'path'

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 确保上传目录存在
      if (!fs.existsSync(uploadDir)) {
        return res.status(200).json({
          success: true,
          data: [],
          message: '暂无照片'
        })
      }

      // 读取上传目录中的所有文件
      const files = fs.readdirSync(uploadDir)
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase()
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
      })

      // 获取文件信息
      const photos = imageFiles.map(file => {
        const filePath = path.join(uploadDir, file)
        const stats = fs.statSync(filePath)
        
        return {
          id: path.parse(file).name,
          fileName: file,
          url: `/uploads/${file}`,
          size: stats.size,
          uploadTime: stats.mtime.toISOString(),
          lastModified: stats.mtime.toISOString()
        }
      })

      // 按上传时间排序（最新的在前）
      photos.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))

      res.status(200).json({
        success: true,
        data: photos,
        count: photos.length
      })

    } catch (error) {
      console.error('Get photos error:', error)
      res.status(500).json({
        success: false,
        error: '获取照片列表失败'
      })
    }
  } else if (req.method === 'DELETE') {
    // 删除照片功能
    const { fileName } = req.body
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: '缺少文件名'
      })
    }

    try {
      const filePath = path.join(uploadDir, fileName)
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        res.status(200).json({
          success: true,
          message: '照片删除成功'
        })
      } else {
        res.status(404).json({
          success: false,
          error: '文件不存在'
        })
      }
    } catch (error) {
      console.error('Delete photo error:', error)
      res.status(500).json({
        success: false,
        error: '删除照片失败'
      })
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }
} 