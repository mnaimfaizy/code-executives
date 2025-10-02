import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface ImageOptimizerProps extends BaseNextJSVisualizationProps {
  images?: ImageConfig[];
  selectedImage?: string;
}

interface ImageConfig {
  id: string;
  name: string;
  originalSize: number; // KB
  originalDimensions: { width: number; height: number };
  formats: ImageFormat[];
  currentFormat: string;
  quality: number;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
  priority: boolean;
}

interface ImageFormat {
  name: string;
  extension: string;
  size: number; // KB
  compressionRatio: number;
  supported: boolean;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  images: initialImages = [],
  selectedImage: initialSelectedImage,
  className = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialSelectedImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Generate sample images
  const generateSampleImages = (): ImageConfig[] => [
    {
      id: 'hero-image',
      name: 'Hero Banner',
      originalSize: 2450,
      originalDimensions: { width: 1920, height: 1080 },
      formats: [
        { name: 'JPEG', extension: 'jpg', size: 450, compressionRatio: 81.6, supported: true },
        { name: 'WebP', extension: 'webp', size: 320, compressionRatio: 86.9, supported: true },
        { name: 'AVIF', extension: 'avif', size: 280, compressionRatio: 88.6, supported: true },
      ],
      currentFormat: 'WebP',
      quality: 80,
      width: 1920,
      height: 1080,
      loading: 'eager',
      priority: true,
    },
    {
      id: 'product-image',
      name: 'Product Photo',
      originalSize: 1800,
      originalDimensions: { width: 800, height: 600 },
      formats: [
        { name: 'JPEG', extension: 'jpg', size: 380, compressionRatio: 78.9, supported: true },
        { name: 'WebP', extension: 'webp', size: 280, compressionRatio: 84.4, supported: true },
        { name: 'AVIF', extension: 'avif', size: 240, compressionRatio: 86.7, supported: true },
      ],
      currentFormat: 'AVIF',
      quality: 85,
      width: 800,
      height: 600,
      loading: 'lazy',
      priority: false,
    },
    {
      id: 'thumbnail',
      name: 'Gallery Thumbnail',
      originalSize: 950,
      originalDimensions: { width: 400, height: 300 },
      formats: [
        { name: 'JPEG', extension: 'jpg', size: 180, compressionRatio: 81.1, supported: true },
        { name: 'WebP', extension: 'webp', size: 140, compressionRatio: 85.3, supported: true },
        { name: 'AVIF', extension: 'avif', size: 120, compressionRatio: 87.4, supported: true },
      ],
      currentFormat: 'WebP',
      quality: 75,
      width: 400,
      height: 300,
      loading: 'lazy',
      priority: false,
    },
  ];

  const images = initialImages.length > 0 ? initialImages : generateSampleImages();
  const currentImage = images.find((img) => img.id === selectedImage);

  // Simulate loading effect
  useEffect(() => {
    if (selectedImage) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedImage]);

  // Get current format info
  const getCurrentFormat = (image: ImageConfig) => {
    return image.formats.find((f) => f.name === image.currentFormat) || image.formats[0];
  };

  // Calculate responsive sizes
  const getResponsiveSizes = (originalWidth: number) => {
    const breakpoints = [640, 768, 1024, 1280, 1536];
    return breakpoints.filter((bp) => bp <= originalWidth);
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get format color
  const getFormatColor = (format: string): string => {
    switch (format) {
      case 'AVIF':
        return '#8b5cf6';
      case 'WebP':
        return '#06b6d4';
      case 'JPEG':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Next.js Image Optimization</h3>
        <p className="text-gray-600">
          Automatic image optimization with modern formats, responsive loading, and lazy loading
        </p>
      </div>

      {/* Image Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((image) => {
          const currentFormat = getCurrentFormat(image);
          const savings = ((image.originalSize - currentFormat.size) / image.originalSize) * 100;

          return (
            <div
              key={image.id}
              className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedImage === image.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedImage(image.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{image.name}</h4>
                <div
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getFormatColor(currentFormat.name) }}
                >
                  {currentFormat.name}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original:</span>
                  <span className="font-medium">{formatSize(image.originalSize * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimized:</span>
                  <span className="font-medium text-green-600">
                    {formatSize(currentFormat.size * 1024)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings:</span>
                  <span className="font-medium text-green-600">{savings.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                {image.originalDimensions.width} × {image.originalDimensions.height}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview and Controls */}
      {currentImage && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Image Preview</h4>

              <div
                className="relative bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: '300px' }}
              >
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <div className="text-gray-600">
                        {currentImage.originalDimensions.width} ×{' '}
                        {currentImage.originalDimensions.height}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {getCurrentFormat(currentImage).name} format
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Format Comparison Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show Format Comparison</span>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showComparison ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showComparison ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Controls and Stats */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Optimization Settings</h4>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {currentImage.formats.map((format) => (
                    <button
                      key={format.name}
                      onClick={() => {
                        // In a real implementation, this would update the image format
                        console.log(`Switching to ${format.name}`);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentImage.currentFormat === format.name
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                      } border`}
                      disabled={!format.supported}
                    >
                      {format.name}
                      {!format.supported && <span className="ml-1 text-xs">🚫</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {currentImage.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={currentImage.quality}
                  onChange={(e) => {
                    // In a real implementation, this would update image quality
                    console.log(`Quality changed to ${e.target.value}`);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              {/* Loading Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loading Strategy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="loading"
                      value="lazy"
                      checked={currentImage.loading === 'lazy'}
                      onChange={() => {
                        // In a real implementation, this would update loading strategy
                        console.log('Changed to lazy loading');
                      }}
                      className="text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Lazy Loading (load when needed)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="loading"
                      value="eager"
                      checked={currentImage.loading === 'eager'}
                      onChange={() => {
                        // In a real implementation, this would update loading strategy
                        console.log('Changed to eager loading');
                      }}
                      className="text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Eager Loading (load immediately)
                    </span>
                  </label>
                </div>
              </div>

              {/* Priority Toggle */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentImage.priority}
                    onChange={() => {
                      // In a real implementation, this would update priority
                      console.log('Toggled priority');
                    }}
                    className="text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    High Priority (preload this image)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Format Comparison */}
          {showComparison && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Format Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentImage.formats.map((format) => (
                  <div key={format.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{format.name}</h5>
                      <div
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: getFormatColor(format.name) }}
                      >
                        {format.compressionRatio.toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium">{formatSize(format.size * 1024)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Compression:</span>
                        <span className="font-medium text-green-600">
                          {format.compressionRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">vs Original:</span>
                        <span className="font-medium text-green-600">
                          {(
                            ((currentImage.originalSize - format.size) /
                              currentImage.originalSize) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Stats */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Impact</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(
                    ((currentImage.originalSize - getCurrentFormat(currentImage).size) /
                      currentImage.originalSize) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-gray-600">Size Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getResponsiveSizes(currentImage.originalDimensions.width).length}
                </div>
                <div className="text-sm text-gray-600">Responsive Sizes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentImage.loading === 'lazy' ? 'Lazy' : 'Eager'}
                </div>
                <div className="text-sm text-gray-600">Loading Strategy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentImage.priority ? 'High' : 'Normal'}
                </div>
                <div className="text-sm text-gray-600">Priority</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Next.js Image Optimization Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Automatic Format Selection</h5>
            <p className="text-sm text-gray-600">
              Next.js automatically serves the best format supported by the browser (AVIF, WebP,
              JPEG). Modern formats can reduce file sizes by up to 50% compared to JPEG.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Responsive Images</h5>
            <p className="text-sm text-gray-600">
              Automatically generates multiple sizes for different screen sizes and device pixel
              ratios, ensuring optimal loading performance across all devices.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Lazy Loading</h5>
            <p className="text-sm text-gray-600">
              Images below the fold are loaded only when they enter the viewport, reducing initial
              page load time. Critical images can be marked as priority for immediate loading.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Built-in Optimization</h5>
            <p className="text-sm text-gray-600">
              Automatic compression, resizing, and WebP conversion. No configuration needed - just
              use the Image component and Next.js handles the rest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptimizer;
