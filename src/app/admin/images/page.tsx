'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type ImageData = {
  id: string;
  url: string;
  type: 'hero' | 'cemetery' | 'contact';
  createdAt: string;
};

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<'hero' | 'cemetery' | 'contact'>('hero');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', imageType);

    try {
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSelectedFile(null);
        fetchImages();
        alert('이미지가 업로드되었습니다.');
      } else {
        alert('업로드에 실패했습니다.');
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/images/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchImages();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">이미지 관리</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">이미지 업로드</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 유형
            </label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value as 'hero' | 'cemetery' | 'contact')}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="hero">홈페이지 히어로 이미지</option>
              <option value="cemetery">장지 이미지</option>
              <option value="contact">상담문의 페이지 이미지</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 선택
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {selectedFile && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">선택된 파일: {selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '업로드'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">업로드된 이미지</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={image.url}
                  alt={image.type}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">{image.type}</div>
              <button
                onClick={() => handleDelete(image.id)}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                삭제
              </button>
              <div className="mt-1 text-xs text-gray-400 break-all">
                {image.url}
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            업로드된 이미지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}


