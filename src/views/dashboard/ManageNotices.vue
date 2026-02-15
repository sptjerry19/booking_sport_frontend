<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Quản lý thông báo</h1>
          <p class="mt-2 text-gray-600">
            Tạo thông báo hệ thống, gửi Push Notification & lưu lịch sử
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="refreshData"
          >
            Làm mới
          </button>
          <button
            class="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
            @click="sendNotice"
          >
            Gửi thông báo ngay
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Tạo thông báo mới
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Tiêu đề</label
                >
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="VD: Sân bóng đá A mở bán khung giờ vàng"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Nhóm nhận thông báo</label
                >
                <select
                  v-model="form.target"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Tất cả user</option>
                  <option value="owners">Chủ sân (Owner)</option>
                  <option value="players">Người đặt sân</option>
                  <option value="custom">Tùy chọn theo sân</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Kênh gửi</label
                >
                <div class="flex flex-wrap gap-3">
                  <label class="flex items-center text-sm text-gray-600 space-x-2">
                    <input
                      v-model="form.channels.push"
                      type="checkbox"
                      class="rounded text-blue-600"
                    />
                    <span>Push notification</span>
                  </label>
                  <label class="flex items-center text-sm text-gray-600 space-x-2">
                    <input
                      v-model="form.channels.email"
                      type="checkbox"
                      class="rounded text-blue-600"
                    />
                    <span>Email</span>
                  </label>
                  <label class="flex items-center text-sm text-gray-600 space-x-2">
                    <input
                      v-model="form.channels.inapp"
                      type="checkbox"
                      class="rounded text-blue-600"
                    />
                    <span>In-app feed</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Lịch gửi</label
                >
                <div class="flex items-center space-x-2">
                  <select
                    v-model="form.schedule"
                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="immediate">Gửi ngay</option>
                    <option value="custom">Hẹn giờ</option>
                  </select>
                  <input
                    v-if="form.schedule === 'custom'"
                    v-model="form.scheduleTime"
                    type="datetime-local"
                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Nội dung</label
              >
              <textarea
                v-model="form.message"
                rows="4"
                placeholder="Nhập nội dung chi tiết..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <div
              v-if="form.target === 'custom'"
              class="mb-4 border border-dashed border-blue-300 rounded-lg p-4"
            >
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Chọn sân cụ thể</label
              >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                <label
                  v-for="venue in accessibleVenues"
                  :key="venue.id"
                  class="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <input
                    type="checkbox"
                    class="rounded text-blue-600"
                    :value="venue.id"
                    v-model="form.venueIds"
                  />
                  <span>{{ venue.name }}</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  v-model="form.requireAcknowledgment"
                  type="checkbox"
                  class="rounded text-blue-600"
                />
                <span>Bắt buộc người nhận xác nhận đã đọc</span>
              </label>
              <button
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                @click="queueNotice"
              >
                Lưu nháp / Hẹn giờ
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">
                Lịch sử thông báo gần nhất
              </h2>
              <select
                v-model="noticeFilter"
                class="border border-gray-200 rounded-md px-3 py-1 text-sm focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="scheduled">Đã hẹn giờ</option>
                <option value="sent">Đã gửi</option>
                <option value="draft">Nháp</option>
              </select>
            </div>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="notice in filteredNotices"
                :key="notice.id"
                class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p class="font-medium text-gray-900">
                    {{ notice.title }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ notice.segmentLabel }} •
                    {{ formatDate(notice.scheduled_at) }}
                  </p>
                </div>
                <div class="flex items-center space-x-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="statusClass(notice.status)"
                  >
                    {{ statusLabel(notice.status) }}
                  </span>
                  <button
                    class="text-sm text-blue-600 hover:text-blue-700"
                    @click="previewNotice(notice)"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    v-if="notice.status === 'draft' || notice.status === 'scheduled'"
                    class="text-sm text-gray-500 hover:text-gray-700"
                    @click="cancelNotice(notice.id)"
                  >
                    Hủy
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Hiệu quả gần đây
            </h3>
            <dl class="space-y-4">
              <div class="flex items-center justify-between">
                <dt class="text-sm text-gray-600">Tỉ lệ mở Push</dt>
                <dd class="text-lg font-semibold text-gray-900">74%</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-sm text-gray-600">Tỉ lệ click</dt>
                <dd class="text-lg font-semibold text-gray-900">28%</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-sm text-gray-600">Số người nhận</dt>
                <dd class="text-lg font-semibold text-gray-900">4,820</dd>
              </div>
            </dl>
            <div class="mt-6">
              <p class="text-sm font-medium text-gray-700 mb-2">
                Cảnh báo quan trọng
              </p>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>• 12 thông báo hẹn giờ trong 24h tới</li>
                <li>• 3 owner chưa cấp quyền nhận push</li>
              </ul>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Template thông báo
            </h3>
            <div class="space-y-3">
              <button
                v-for="template in templates"
                :key="template.id"
                class="w-full text-left border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-400 transition-colors"
                @click="applyTemplate(template)"
              >
                <p class="font-medium text-gray-900">{{ template.title }}</p>
                <p class="text-xs text-gray-500">{{ template.description }}</p>
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Kế hoạch gửi tự động
            </h3>
            <p class="text-sm text-gray-500 mb-4">
              Theo dõi các chiến dịch push định kỳ cho owner và người đặt sân.
            </p>
            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-center justify-between">
                <span>Báo cáo doanh thu tuần</span>
                <span class="text-gray-500">Thứ hai • 08:00</span>
              </li>
              <li class="flex items-center justify-between">
                <span>Nhắc booking trước giờ đá</span>
                <span class="text-gray-500">1h trước</span>
              </li>
              <li class="flex items-center justify-between">
                <span>Cảnh báo khung giờ trống</span>
                <span class="text-gray-500">Mỗi tối</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useApi } from "@/composables/useApi";
import { useAuth } from "@/composables/useAuth";

export default {
  name: "ManageNotices",
  setup() {
    const api = useApi();
    const { user, isAdmin } = useAuth();

    const loading = ref(false);
    const noticeFilter = ref("all");
    const venues = ref([]);
    const notices = ref([]);

    const form = ref({
      title: "",
      message: "",
      target: "all",
      channels: {
        push: true,
        email: false,
        inapp: true,
      },
      schedule: "immediate",
      scheduleTime: "",
      venueIds: [],
      requireAcknowledgment: false,
    });

    const templates = [
      {
        id: 1,
        title: "Cảnh báo khung giờ trống",
        description: "Nhắc owner mở ưu đãi cho các khung giờ trống nhiều.",
        payload: {
          title: "Khung giờ trống cần tối ưu",
          message:
            "Trong 48h tới có 6 khung giờ chưa có booking. Bạn có muốn tạo khuyến mãi?",
        },
      },
      {
        id: 2,
        title: "Báo cáo doanh thu tuần",
        description: "Gửi tới owner vào thứ hai hàng tuần.",
        payload: {
          title: "Doanh thu tuần qua",
          message:
            "Doanh thu tuần rồi đạt 48.200.000đ (+12%). Bấm xem chi tiết.",
        },
      },
    ];

    const mockVenues = [
      { id: 1, name: "Sân bóng đá Bắc Sài Gòn", owner_id: 22 },
      { id: 2, name: "Cum sân cầu lông Q5", owner_id: 22 },
      { id: 3, name: "Sân tennis Quang Trung", owner_id: 18 },
    ];

    const mockNotices = [
      {
        id: 101,
        title: "Bảo trì hệ thống thanh toán",
        status: "scheduled",
        scheduled_at: "2025-11-25T04:00:00Z",
        segment: "owners",
      },
      {
        id: 102,
        title: "Ưu đãi Black Friday",
        status: "sent",
        scheduled_at: "2025-11-18T09:00:00Z",
        segment: "all",
      },
      {
        id: 103,
        title: "Nhắc xác nhận booking",
        status: "draft",
        scheduled_at: null,
        segment: "owners",
      },
    ];

    const accessibleVenues = computed(() => {
      if (isAdmin.value) {
        return venues.value;
      }
      return venues.value.filter(
        (venue) => venue.owner_id === user.value?.id
      );
    });

    const filteredNotices = computed(() => {
      return notices.value.filter((notice) => {
        return (
          noticeFilter.value === "all" || notice.status === noticeFilter.value
        );
      });
    });

    const refreshData = async () => {
      try {
        loading.value = true;
        // const [noticeRes, venueRes] = await Promise.all([
        //   api.getNotices(),
        //   api.getVenues(),
        // ]);
        notices.value = mockNotices.map((notice) => ({
          ...notice,
          segmentLabel: segmentLabel(notice.segment),
        }));
        venues.value = mockVenues;
      } catch (error) {
        console.error("Failed to load notices:", error);
      } finally {
        loading.value = false;
      }
    };

    const segmentLabel = (segment) => {
      const map = {
        all: "Tất cả người dùng",
        owners: "Chủ sân",
        players: "Người đặt sân",
        custom: "Theo sân chỉ định",
      };
      return map[segment] || "Không xác định";
    };

    const statusLabel = (status) => {
      const map = {
        draft: "Nháp",
        scheduled: "Đã hẹn giờ",
        sent: "Đã gửi",
        cancelled: "Đã hủy",
      };
      return map[status] || status;
    };

    const statusClass = (status) => {
      const classes = {
        draft: "bg-gray-100 text-gray-800",
        scheduled: "bg-yellow-100 text-yellow-800",
        sent: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
      };
      return classes[status] || "bg-gray-100 text-gray-800";
    };

    const queueNotice = async () => {
      console.info("Schedule / draft notice:", form.value);
    };

    const sendNotice = async () => {
      console.info("Send notice immediately:", form.value);
    };

    const previewNotice = (notice) => {
      console.info("Preview notice", notice);
    };

    const cancelNotice = (noticeId) => {
      notices.value = notices.value.map((notice) =>
        notice.id === noticeId ? { ...notice, status: "cancelled" } : notice
      );
    };

    const applyTemplate = (template) => {
      form.value = {
        ...form.value,
        title: template.payload.title,
        message: template.payload.message,
      };
    };

    const formatDate = (value) => {
      if (!value) return "—";
      return new Date(value).toLocaleString("vi-VN");
    };

    onMounted(() => {
      refreshData();
    });

    return {
      user,
      loading,
      form,
      templates,
      noticeFilter,
      notices,
      accessibleVenues,
      filteredNotices,
      refreshData,
      queueNotice,
      sendNotice,
      previewNotice,
      cancelNotice,
      applyTemplate,
      statusLabel,
      statusClass,
      formatDate,
    };
  },
};
</script>

