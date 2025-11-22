'use client';

import { useEffect, useState, FormEvent } from 'react';

type FuneralItem = {
  id: string;
  title_ko: string;
  title_vi: string;
  description_ko: string;
  description_vi: string;
  images: string[];
  step_number: number;
  created_at: string;
  updated_at: string;
};

export default function FuneralItemsAdminPage() {
  const [items, setItems] = useState<FuneralItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [titleKo, setTitleKo] = useState('');
  const [descriptionKo, setDescriptionKo] = useState('');
  const [titleVi, setTitleVi] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [stepNumber, setStepNumber] = useState<number>(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load funeral items
  const loadItems = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/funeral-items', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load funeral items');
      }
      const data = await res.json();
      setItems(data.data || []);
    } catch (err) {
      console.error('[FUNERAL ITEMS] Load error:', err);
      setError('장례 항목 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Handle multiple file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  // Upload images to Supabase Storage
  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/funeral-items/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      setUploadedImageUrls([...uploadedImageUrls, ...data.urls]);
      setSelectedFiles([]);
      setMessage(`${data.urls.length}개의 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('[FUNERAL ITEMS] Image upload error:', error);
      setError(
        error instanceof Error
          ? error.message
          : '이미지 업로드 중 오류가 발생했습니다.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove image URL from list
  const removeImageUrl = (index: number) => {
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
  };

  // Translate Korean to Vietnamese
  const handleTranslate = async () => {
    if (!titleKo.trim() || !descriptionKo.trim()) {
      setError('한국어 제목과 설명을 먼저 입력해주세요.');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      // Call translation API (we'll create a simple endpoint for this)
      const response = await fetch('/api/admin/funeral-items/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title_ko: titleKo,
          description_ko: descriptionKo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setTitleVi(data.title_vi || '');
      setDescriptionVi(data.description_vi || '');
      setMessage('베트남어로 번역되었습니다.');
    } catch (error) {
      console.error('[FUNERAL ITEMS] Translation error:', error);
      setError(
        error instanceof Error
          ? error.message
          : '번역 중 오류가 발생했습니다.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle form submission (create new item)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    if (!titleKo.trim() || !descriptionKo.trim()) {
      setError('제목과 설명을 모두 입력해주세요.');
      setIsSaving(false);
      return;
    }

    if (!titleVi.trim() || !descriptionVi.trim()) {
      setError('베트남어 번역이 필요합니다. "다시 번역" 버튼을 클릭하세요.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/funeral-items/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title_ko: titleKo.trim(),
          description_ko: descriptionKo.trim(),
          title_vi: titleVi.trim(),
          description_vi: descriptionVi.trim(),
          step_number: stepNumber,
          images: uploadedImageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save funeral item');
      }

      // Success
      setMessage('장례 항목이 저장되었습니다.');
      
      // Reset form
      setTitleKo('');
      setDescriptionKo('');
      setTitleVi('');
      setDescriptionVi('');
      setStepNumber(items.length + 1);
      setUploadedImageUrls([]);
      setSelectedFiles([]);

      // Reload items
      await loadItems();
    } catch (err) {
      console.error('[FUNERAL ITEMS] Save error:', err);
      setError(
        err instanceof Error
          ? err.message
          : '장례 항목 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit item
  const handleEdit = (item: FuneralItem) => {
    setEditingId(item.id);
    setTitleKo(item.title_ko);
    setDescriptionKo(item.description_ko);
    setTitleVi(item.title_vi);
    setDescriptionVi(item.description_vi);
    setStepNumber(item.step_number);
    setUploadedImageUrls(item.images || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle update item
  const handleUpdate = async () => {
    if (!editingId) return;

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/funeral-items/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: editingId,
          title_ko: titleKo.trim(),
          description_ko: descriptionKo.trim(),
          title_vi: titleVi.trim(),
          description_vi: descriptionVi.trim(),
          step_number: stepNumber,
          images: uploadedImageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update funeral item');
      }

      setMessage('장례 항목이 업데이트되었습니다.');
      
      // Reset form
      setEditingId(null);
      setTitleKo('');
      setDescriptionKo('');
      setTitleVi('');
      setDescriptionVi('');
      setStepNumber(items.length + 1);
      setUploadedImageUrls([]);
      setSelectedFiles([]);

      // Reload items
      await loadItems();
    } catch (err) {
      console.error('[FUNERAL ITEMS] Update error:', err);
      setError(
        err instanceof Error
          ? err.message
          : '장례 항목 업데이트 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitleKo('');
    setDescriptionKo('');
    setTitleVi('');
    setDescriptionVi('');
    setStepNumber(items.length + 1);
    setUploadedImageUrls([]);
    setSelectedFiles([]);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        장례 절차 관리
      </h1>

      {/* Messages */}
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}
        className="bg-white p-6 rounded-lg shadow mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? '항목 수정' : '새 항목 추가'}
        </h2>

        {/* Step Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            단계 번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={stepNumber}
            onChange={(e) => setStepNumber(parseInt(e.target.value) || 1)}
            min="1"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Multiple Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 (여러 개 선택 가능)
          </label>
          <div className="flex gap-4 mb-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? '업로드 중...' : `업로드 (${selectedFiles.length})`}
              </button>
            )}
          </div>
          {uploadedImageUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {uploadedImageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Korean Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 (한국어) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titleKo}
            onChange={(e) => setTitleKo(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="한국어 제목을 입력하세요"
          />
        </div>

        {/* Korean Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명 (한국어) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={descriptionKo}
            onChange={(e) => setDescriptionKo(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="한국어 설명을 입력하세요"
          />
        </div>

        {/* Vietnamese Title (Manual Edit) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 (베트남어) <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">(수동 편집 가능)</span>
          </label>
          <input
            type="text"
            value={titleVi}
            onChange={(e) => setTitleVi(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="베트남어 제목 (자동 번역 또는 수동 입력)"
          />
        </div>

        {/* Vietnamese Description (Manual Edit) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명 (베트남어) <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">(수동 편집 가능)</span>
          </label>
          <textarea
            value={descriptionVi}
            onChange={(e) => setDescriptionVi(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="베트남어 설명 (자동 번역 또는 수동 입력)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !titleKo.trim() || !descriptionKo.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? '번역 중...' : '다시 번역'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : editingId ? '업데이트' : '저장하기'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              취소
            </button>
          )}
        </div>
      </form>

      {/* Items List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">저장된 항목 목록</h2>
        {isLoading ? (
          <p className="text-gray-600">로딩 중...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600">저장된 항목이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      단계 {item.step_number}: {item.title_ko}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description_ko}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                  >
                    수정
                  </button>
                </div>
                {item.images && item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.images.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`Step ${item.step_number} - Image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Vietnamese:</strong>
                  </p>
                  <p className="text-sm font-medium mb-1">{item.title_vi}</p>
                  <p className="text-xs text-gray-600">{item.description_vi}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
