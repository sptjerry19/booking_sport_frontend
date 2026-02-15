<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-wide text-indigo-600 font-semibold">
            Admin only
          </p>
          <h1 class="text-3xl font-bold text-gray-900">Quản lý môn thể thao</h1>
          <p class="mt-2 text-gray-600">
            Chuẩn hóa danh mục môn thể thao để chủ sân đăng ký chính xác
          </p>
        </div>
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          @click="openCreateModal"
        >
          Thêm môn thể thao
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Tìm tên môn thể thao..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg
                class="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
            <select
              v-model="filters.category"
              class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="field">Sân rộng (bóng đá, bóng chuyền...)</option>
              <option value="court">Sân vừa (cầu lông, tennis...)</option>
              <option value="indoor">Trong nhà</option>
            </select>
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ filteredSports.length }} môn được định nghĩa</span>
            <label class="flex items-center space-x-2">
              <input
                v-model="filters.showInactive"
                type="checkbox"
                class="rounded text-blue-600"
              />
              <span>Hiển thị cả môn bị ẩn</span>
            </label>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="sport in filteredSports"
            :key="sport.id"
            class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  :class="sport.iconBg"
                >
                  {{ sport.icon }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ sport.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ sport.description }}
                  </p>
                </div>
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide">
                <span
                  class="px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold"
                >
                  {{ sport.surface }}
                </span>
                <span
                  class="px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold"
                >
                  {{ sport.duration }} phút / slot
                </span>
                <span
                  v-if="sport.rating"
                  class="px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 font-semibold"
                >
                  {{ sport.rating }} sân đăng ký
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <label class="flex items-center text-sm text-gray-600 space-x-2">
                <span>Kích hoạt</span>
                <input
                  type="checkbox"
                  class="rounded text-blue-600"
                  :checked="sport.active"
                  @change="toggleSportStatus(sport)"
                />
              </label>
              <button
                class="text-sm text-blue-600 hover:text-blue-700"
                @click="editSport(sport)"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingSport ? "Chỉnh sửa môn thể thao" : "Thêm môn thể thao" }}
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
                >Tên môn</label
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
                placeholder="VD: ⚽️"
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Loại sân</label
                >
                <select
                  v-model="form.surface"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sân rộng">Sân rộng</option>
                  <option value="Sân tiêu chuẩn">Sân tiêu chuẩn</option>
                  <option value="Trong nhà">Trong nhà</option>
                  <option value="Ngoài trời">Ngoài trời</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Thời lượng slot</label
                >
                <input
                  v-model.number="form.duration"
                  type="number"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  min="30"
                  step="15"
                />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="rounded text-blue-600"
                />
                <span>Cho phép owner đăng ký môn này</span>
              </label>
              <button
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                @click="saveSport"
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
import { useApi } from "@/composables/useApi";

export default {
  name: "ManageSports",
  setup() {
    const api = useApi();

    const showModal = ref(false);
    const editingSport = ref(null);
    const filters = ref({
      search: "",
      category: "all",
      showInactive: false,
    });

    const sports = ref([
      {
        id: 1,
        name: "Bóng đá",
        icon: "⚽️",
        iconBg: "bg-green-100",
        description: "Sân cỏ nhân tạo 5-7 người, diện tích lớn",
        surface: "Sân rộng",
        duration: 90,
        active: true,
        rating: 128,
        category: "field",
      },
      {
        id: 2,
        name: "Cầu lông",
        icon: "🏸",
        iconBg: "bg-yellow-100",
        description: "Sân tiêu chuẩn 13.4m, trong nhà",
        surface: "Trong nhà",
        duration: 60,
        active: true,
        rating: 86,
        category: "indoor",
      },
      {
        id: 3,
        name: "Tennis",
        icon: "🎾",
        iconBg: "bg-blue-100",
        description: "Sân xi măng hoặc cỏ nhân tạo, chuẩn ITF",
        surface: "Sân tiêu chuẩn",
        duration: 60,
        active: true,
        rating: 42,
        category: "court",
      },
      {
        id: 4,
        name: "Pickleball",
        icon: "🥎",
        iconBg: "bg-pink-100",
        description: "Môn mới, pha trộn tennis & cầu lông",
        surface: "Trong nhà",
        duration: 45,
        active: false,
        rating: 6,
        category: "court",
      },
    ]);

    const form = ref({
      name: "",
      icon: "",
      description: "",
      surface: "Sân rộng",
      duration: 60,
      active: true,
    });

    const filteredSports = computed(() => {
      return sports.value.filter((sport) => {
        const byName =
          filters.value.search.trim().length === 0 ||
          sport.name.toLowerCase().includes(filters.value.search.toLowerCase());
        const byCategory =
          filters.value.category === "all" ||
          sport.category === filters.value.category;
        const byActive =
          filters.value.showInactive || sport.active === true;
        return byName && byCategory && byActive;
      });
    });

    const openCreateModal = () => {
      editingSport.value = null;
      form.value = {
        name: "",
        icon: "",
        description: "",
        surface: "Sân rộng",
        duration: 60,
        active: true,
      };
      showModal.value = true;
    };

    const editSport = (sport) => {
      editingSport.value = sport;
      form.value = { ...sport };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const saveSport = async () => {
      if (editingSport.value) {
        const index = sports.value.findIndex(
          (sport) => sport.id === editingSport.value.id
        );
        if (index !== -1) {
          sports.value.splice(index, 1, { ...form.value });
        }
      } else {
        sports.value.unshift({
          id: Date.now(),
          ...form.value,
          iconBg: "bg-gray-100",
          rating: 0,
          category: "court",
        });
      }
      showModal.value = false;
    };

    const toggleSportStatus = (sport) => {
      sport.active = !sport.active;
    };

    return {
      filters,
      sports,
      filteredSports,
      showModal,
      editingSport,
      form,
      openCreateModal,
      editSport,
      closeModal,
      saveSport,
      toggleSportStatus,
    };
  },
};
</script>

