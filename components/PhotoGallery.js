import { useState, useEffect } from 'react'

export default function PhotoGallery({ onDeletePhoto }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)

  // 加载照片列表
  const loadPhotos = async () => {
    try {
      const response = await fetch('/api/photos')
      const result = await response.json()
      
      if (result.success) {
        setPhotos(result.data)
      }
    } catch (error) {
      console.error('Load photos error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除照片
  const handleDeletePhoto = async (fileName) => {
    if (!confirm('确定要删除这张照片吗？')) {
      return
    }

    setDeleteLoading(fileName)
    
    try {
      const response = await fetch('/api/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName })
      })

      const result = await response.json()
      
      if (result.success) {
        setPhotos(photos.filter(photo => photo.fileName !== fileName))
        onDeletePhoto?.(fileName)
        setSelectedPhoto(null)
      }
    } catch (error) {
      console.error('Delete photo error:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2">暂无照片</p>
      </div>
    )
  }

  return (
    <div>
      {/* 照片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt={photo.fileName}
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setSelectedPhoto(photo)}
            />
            
            {/* 删除按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeletePhoto(photo.fileName)
              }}
              disabled={deleteLoading === photo.fileName}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              {deleteLoading === photo.fileName ? '...' : '×'}
            </button>
            
            {/* 文件信息 */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs truncate">{photo.fileName}</p>
              <p className="text-xs">{formatFileSize(photo.size)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 照片预览模态框 */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold truncate">{selectedPhoto.fileName}</h3>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.fileName}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>文件大小:</strong> {formatFileSize(selectedPhoto.size)}
                </div>
                <div>
                  <strong>上传时间:</strong> {formatDate(selectedPhoto.uploadTime)}
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <a
                  href={selectedPhoto.url}
                  download={selectedPhoto.fileName}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  下载
                </a>
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.fileName)}
                  disabled={deleteLoading === selectedPhoto.fileName}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteLoading === selectedPhoto.fileName ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 