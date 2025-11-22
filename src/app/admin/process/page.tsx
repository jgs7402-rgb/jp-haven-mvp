'use client';

import { useEffect, useState, FormEvent } from 'react';

type ProcessStep = {
  id?: string;
  step_order: number;
  title: string;
  description: string;
  images: string[];
};

type Locale = 'ko' | 'vi';

export default function ProcessAdminPage() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load steps for current locale
  const loadSteps = async (targetLocale: Locale) => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/process?locale=${targetLocale}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load process steps');
      }
      const data = await res.json();
      setSteps(data.steps || []);
    } catch (err) {
      console.error('[PROCESS] Load error:', err);
      setError('장례 절차 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSteps(locale);
  }, [locale]);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== index) {
      const newSteps = [...steps];
      const draggedItem = newSteps[draggedIndex];
      newSteps.splice(draggedIndex, 1);
      newSteps.splice(index, 0, draggedItem);
      
      // Update step_order
      const updatedSteps = newSteps.map((step, idx) => ({
        ...step,
        step_order: idx + 1,
      }));
      setSteps(updatedSteps);
      setDraggedIndex(index);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle image upload
  const handleImageUpload = async (
    stepIndex: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/process/upload-images', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      // Update step images
      const newSteps = [...steps];
      newSteps[stepIndex].images = [
        ...newSteps[stepIndex].images,
        ...data.urls,
      ];
      setSteps(newSteps);
      setMessage(`${data.urls.length}개의 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('[PROCESS] Image upload error:', error);
      setError(
        error instanceof Error
          ? error.message
          : '이미지 업로드 중 오류가 발생했습니다.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove image from step
  const removeImage = (stepIndex: number, imageIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].images = newSteps[stepIndex].images.filter(
      (_, idx) => idx !== imageIndex
    );
    setSteps(newSteps);
  };

  // Add new step
  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_order: steps.length + 1,
        title: '',
        description: '',
        images: [],
      },
    ]);
  };

  // Remove step
  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, idx) => idx !== index);
    // Reorder steps
    const reorderedSteps = newSteps.map((step, idx) => ({
      ...step,
      step_order: idx + 1,
    }));
    setSteps(reorderedSteps);
  };

  // Update step field
  const updateStep = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    // Validate steps
    const validSteps = steps.filter(
      (step) => step.title.trim() && step.description.trim()
    );

    if (validSteps.length === 0) {
      setError('최소 하나의 유효한 절차를 입력해주세요.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/process', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          locale,
          steps: validSteps,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save process steps');
      }

      setMessage(
        locale === 'ko'
          ? '장례 절차가 저장되었고, 베트남어 버전도 자동 번역되어 저장되었습니다.'
          : '장례 절차가 저장되었습니다.'
      );

      // Reload steps
      await loadSteps(locale);
    } catch (err) {
      console.error('[PROCESS] Save error:', err);
      setError(
        err instanceof Error
          ? err.message
          : '장례 절차 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
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

      {/* Locale Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          언어 선택
        </label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ko">한국어</option>
          <option value="vi">베트남어</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          한국어로 저장하면 베트남어로 자동 번역되어 저장됩니다.
        </p>
      </div>

      {/* Steps Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white p-6 rounded-lg shadow border-2 ${
                draggedIndex === index
                  ? 'border-primary opacity-50'
                  : 'border-gray-200'
              } cursor-move`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">☰</span>
                  <span className="font-semibold text-lg">
                    단계 {step.step_order}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  삭제
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(index, 'title', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`${locale === 'ko' ? '단계 제목' : 'Tiêu đề bước'}`}
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={step.description}
                  onChange={(e) =>
                    updateStep(index, 'description', e.target.value)
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`${locale === 'ko' ? '단계 설명' : 'Mô tả bước'}`}
                />
              </div>

              {/* Images */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(index, e.target.files)}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {step.images && step.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.images.map((imageUrl, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Step ${step.step_order} - Image ${imgIndex + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, imgIndex)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        <button
          type="button"
          onClick={addStep}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          + 단계 추가
        </button>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving || uploading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
