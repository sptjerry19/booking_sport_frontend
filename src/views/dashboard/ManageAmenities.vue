<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-wide text-indigo-600 font-semibold">
            Admin only
          </p>
          <h1 class="text-3xl font-bold text-gray-900">Quản lý tiện ích</h1>
          <p class="mt-2 text-gray-600">
            Thiết lập danh sách tiện ích chuẩn để owner khai báo và người dùng
            lọc tìm kiếm.
          </p>
        </div>
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          @click="openModal"
        >
          + Thêm tiện ích
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Tiện ích đang kích hoạt</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ activeCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Tiện ích phổ biến</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">Phòng tắm</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Được gợi ý nhiều nhất</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">Bãi đậu xe</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center space-x-3">
            <input
              v-model="search"
              type="text"
              placeholder="Tìm tiện ích..."
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              v-model="category"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="comfort">Tiện nghi</option>
              <option value="service">Dịch vụ</option>
              <option value="safety">An toàn</option>
            </select>
          </div>
          <label class="flex items-center space-x-2 text-sm text-gray-500">
            <input
              v-model="onlyPopular"
              type="checkbox"
              class="rounded text-blue-600"
            />
            <span>Chỉ hiển thị tiện ích có tần suất cao</span>
          </label>
        </div>
        <ul class="divide-y divide-gray-100">
          <li
            v-for="amenity in filteredAmenities"
            :key="amenity.id"
            class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-blue-50 text-blue-600"
                >
                  {{ amenity.icon }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">
                    {{ amenity.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ amenity.description }}
                  </p>
                </div>
              </div>
              <div class="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
                <span class="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {{ categoryLabel(amenity.category) }}
                </span>
                <span
                  class="px-2 py-1 rounded-full bg-blue-50 text-blue-600"
                  v-if="amenity.popularity >= 60"
                >
                  Phổ biến
                </span>
                <span
                  class="px-2 py-1 rounded-full bg-green-50 text-green-600"
                  v-if="amenity.requiresStaff"
                >
                  Cần nhân sự
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <label class="flex items-center space-x-2 text-sm text-gray-600">
                <span>Kích hoạt</span>
                <input
                  type="checkbox"
                  class="rounded text-blue-600"
                  :checked="amenity.active"
                  @change="toggleAmenity(amenity)"
                />
              </label>
              <button
                class="text-sm text-blue-600 hover:text-blue-700"
                @click="editAmenity(amenity)"
              >
                Chỉnh sửa
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingAmenity ? "Chỉnh sửa tiện ích" : "Thêm tiện ích mới" }}
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="closeModal"
            >
              ✕
            </button>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Tên tiện ích</label
              >
              <input
                v-model="form.name"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Biểu tượng</label
              >
              <input
                v-model="form.icon"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 🚿, 🅿️"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Mô tả</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Nhóm tiện ích</label
              >
              <select
                v-model="form.category"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="comfort">Tiện nghi</option>
                <option value="service">Dịch vụ</option>
                <option value="safety">An toàn</option>
              </select>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  v-model="form.requiresStaff"
                  type="checkbox"
                  class="rounded text-blue-600"
                />
                <span>Cần nhân sự/phí vận hành riêng</span>
              </label>
              <label class="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="rounded text-blue-600"
                />
                <span>Kích hoạt ngay</span>
              </label>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button class="text-sm text-gray-500" @click="closeModal">
                Hủy
              </button>
              <button
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                @click="saveAmenity"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "ManageAmenities",
  setup() {
    const amenities = ref([
      {
        id: 1,
        name: "Phòng tắm",
        icon: "🚿",
        description: "Phòng tắm riêng sạch sẽ sau khi chơi",
        category: "comfort",
        popularity: 88,
        requiresStaff: true,
        active: true,
      },
      {
        id: 2,
        name: "Bãi đậu xe",
        icon: "🅿️",
        description: "Bãi đậu xe ô tô và xe máy rộng rãi",
        category: "service",
        popularity: 92,
        requiresStaff: false,
        active: true,
      },
      {
        id: 3,
        name: "Phòng y tế",
        icon: "⛑️",
        description: "Trang bị sơ cứu và nhân sự trực",
        category: "safety",
        popularity: 34,
        requiresStaff: true,
        active: false,
      },
      {
        id: 4,
        name: "Máy lạnh",
        icon: "❄️",
        description: "Máy lạnh trong khu vực nghỉ giữa giờ",
        category: "comfort",
        popularity: 57,
        requiresStaff: false,
        active: true,
      },
    ]);

    const showModal = ref(false);
    const editingAmenity = ref(null);
    const form = ref({
      name: "",
      icon: "",
      description: "",
      category: "comfort",
      requiresStaff: false,
      active: true,
    });

    const search = ref("");
    const category = ref("all");
    const onlyPopular = ref(false);

    const filteredAmenities = computed(() => {
      return amenities.value.filter((amenity) => {
        const matchesSearch =
          search.value.trim().length === 0 ||
          amenity.name.toLowerCase().includes(search.value.toLowerCase());
        const matchesCategory =
          category.value === "all" || amenity.category === category.value;
        const matchesPopular = !onlyPopular.value || amenity.popularity >= 60;
        return matchesSearch && matchesCategory && matchesPopular;
      });
    });

    const activeCount = computed(() => {
      return amenities.value.filter((amenity) => amenity.active).length;
    });

    const categoryLabel = (value) => {
      const map = {
        comfort: "Tiện nghi",
        service: "Dịch vụ",
        safety: "An toàn",
      };
      return map[value] || "Khác";
    };

    const openModal = () => {
      editingAmenity.value = null;
      form.value = {
        name: "",
        icon: "",
        description: "",
        category: "comfort",
        requiresStaff: false,
        active: true,
      };
      showModal.value = true;
    };

    const editAmenity = (amenity) => {
      editingAmenity.value = amenity;
      form.value = { ...amenity };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const saveAmenity = () => {
      if (editingAmenity.value) {
        const index = amenities.value.findIndex(
          (item) => item.id === editingAmenity.value.id
        );
        if (index !== -1) {
          amenities.value.splice(index, 1, { ...form.value });
        }
      } else {
        amenities.value.unshift({
          id: Date.now(),
          popularity: 0,
          ...form.value,
        });
      }
      showModal.value = false;
    };

    const toggleAmenity = (amenity) => {
      amenity.active = !amenity.active;
    };

    return {
      amenities,
      filteredAmenities,
      activeCount,
      categoryLabel,
      search,
      category,
      onlyPopular,
      showModal,
      form,
      editingAmenity,
      openModal,
      closeModal,
      saveAmenity,
      editAmenity,
      toggleAmenity,
    };
  },
};
</script>

