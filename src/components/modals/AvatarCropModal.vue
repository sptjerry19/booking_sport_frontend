<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Cắt ảnh đại diện</h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Cropper Container -->
        <div class="mb-6">
          <div
            ref="cropperContainer"
            class="w-full h-96 bg-gray-100 rounded-lg overflow-hidden"
            style="min-height: 300px"
          >
            <img
              ref="cropperImage"
              :src="imageUrl"
              alt="Crop preview"
              class="w-full h-full object-contain"
              style="display: none"
            />
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <button
              @click="rotateLeft"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              title="Xoay trái"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
            <button
              @click="rotateRight"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              title="Xoay phải"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
            <button
              @click="reset"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              title="Đặt lại"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </div>

          <div class="text-sm text-gray-500">
            Kéo để di chuyển, kéo góc để thay đổi kích thước
          </div>
        </div>

        <!-- Preview -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Xem trước:</h4>
          <div class="flex items-center space-x-4">
            <div
              class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center"
            >
              <img
                ref="previewImage"
                :src="previewUrl"
                alt="Preview"
                class="w-full h-full object-cover"
                style="display: none"
              />
              <span v-if="!previewUrl" class="text-gray-400 text-xs"
                >Preview</span
              >
            </div>
            <div class="text-sm text-gray-600">
              <p>Kích thước: 64x64px</p>
              <p>Định dạng: JPG/PNG</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            @click="cropAndUpload"
            :disabled="uploading"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md font-medium transition-colors flex items-center"
          >
            <span
              v-if="uploading"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></span>
            {{ uploading ? "Đang tải lên..." : "Xác nhận" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import Cropper from "cropperjs";

export default {
  name: "AvatarCropModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    imageFile: {
      type: File,
      default: null,
    },
  },
  emits: ["close", "upload"],
  setup(props, { emit }) {
    const cropperContainer = ref(null);
    const cropperImage = ref(null);
    const previewImage = ref(null);
    const imageUrl = ref("");
    const previewUrl = ref("");
    const uploading = ref(false);
    let cropper = null;

    // Initialize cropper when modal opens
    const initCropper = async () => {
      if (!props.imageFile || !cropperContainer.value) return;

      // Create object URL for the image
      imageUrl.value = URL.createObjectURL(props.imageFile);

      await nextTick();

      if (cropperImage.value) {
        cropperImage.value.style.display = "block";

        // Initialize cropper
        cropper = new Cropper(cropperImage.value, {
          aspectRatio: 1,
          viewMode: 1,
          dragMode: "move",
          autoCropArea: 0.8,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          crop: updatePreview,
        });

        console.log("Cropper initialized:", cropper);
      }
    };

    // Update preview when crop area changes
    const updatePreview = () => {
      if (!cropper || typeof cropper.getCroppedCanvas !== "function") return;

      try {
        const canvas = cropper.getCroppedCanvas({
          width: 64,
          height: 64,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        });

        if (canvas) {
          previewUrl.value = canvas.toDataURL("image/jpeg", 0.9);
          if (previewImage.value) {
            previewImage.value.style.display = "block";
          }
        }
      } catch (error) {
        console.error("Error updating preview:", error);
      }
    };

    // Rotate left
    const rotateLeft = () => {
      if (cropper) {
        cropper.rotate(-90);
      }
    };

    // Rotate right
    const rotateRight = () => {
      if (cropper) {
        cropper.rotate(90);
      }
    };

    // Reset cropper
    const reset = () => {
      if (cropper) {
        cropper.reset();
      }
    };

    // Crop and upload
    const cropAndUpload = async () => {
      if (!cropper || typeof cropper.getCroppedCanvas !== "function") {
        console.error("Cropper not initialized properly");
        alert("Có lỗi xảy ra khi khởi tạo cropper!");
        return;
      }

      uploading.value = true;

      try {
        const canvas = cropper.getCroppedCanvas({
          width: 200,
          height: 200,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        });

        if (canvas) {
          // Convert canvas to blob
          canvas.toBlob(
            async (blob) => {
              if (blob) {
                // Create a new file from the blob
                const croppedFile = new File([blob], "avatar.jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });

                // Emit the cropped file to parent
                emit("upload", croppedFile);
              }
            },
            "image/jpeg",
            0.9
          );
        }
      } catch (error) {
        console.error("Error cropping image:", error);
        alert("Có lỗi xảy ra khi cắt ảnh!");
      } finally {
        uploading.value = false;
      }
    };

    // Close modal
    const closeModal = () => {
      if (cropper && typeof cropper.destroy === "function") {
        cropper.destroy();
        cropper = null;
      }

      // Clean up object URLs
      if (imageUrl.value) {
        URL.revokeObjectURL(imageUrl.value);
        imageUrl.value = "";
      }
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = "";
      }

      emit("close");
    };

    // Watch for modal open/close
    watch(
      () => props.isOpen,
      (newVal) => {
        if (newVal) {
          nextTick(() => {
            initCropper();
          });
        } else {
          if (cropper) {
            cropper.destroy();
            cropper = null;
          }
          // Clean up object URLs
          if (imageUrl.value) {
            URL.revokeObjectURL(imageUrl.value);
            imageUrl.value = "";
          }
          if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
            previewUrl.value = "";
          }
        }
      }
    );

    onMounted(() => {
      if (props.isOpen) {
        initCropper();
      }
    });

    onUnmounted(() => {
      if (cropper) {
        cropper.destroy();
      }
      // Clean up object URLs
      if (imageUrl.value) {
        URL.revokeObjectURL(imageUrl.value);
      }
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
    });

    return {
      cropperContainer,
      cropperImage,
      previewImage,
      imageUrl,
      previewUrl,
      uploading,
      rotateLeft,
      rotateRight,
      reset,
      cropAndUpload,
      closeModal,
    };
  },
};
</script>

<style scoped>
/* Cropper.js styles are imported globally in main.js */
</style>
