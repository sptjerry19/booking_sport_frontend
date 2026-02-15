<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Quản lý sân & khung giờ</h1>
          <p class="mt-2 text-gray-600">
            Quản lý thời gian hoạt động, chỉnh sửa thông tin sân và xử lý booking
            ngay tại một nơi.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            @click="syncWithCalendar"
          >
            Đồng bộ Google Calendar
          </button>
          <button
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            @click="refreshData"
          >
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Danh sách sân quản lý
            </h3>
            <div class="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
              <button
                v-for="venue in accessibleVenues"
                :key="venue.id"
                :class="[
                  'w-full text-left border rounded-lg p-4 transition-all',
                  venue.id === selectedVenueId
                    ? 'border-blue-500 shadow-md bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
                @click="selectVenue(venue.id)"
              >
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-gray-900">{{ venue.name }}</p>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="venue.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ venue.status === "active" ? "Hoạt động" : "Tạm dừng" }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">{{ venue.address }}</p>
                <p class="mt-2 text-xs text-gray-500">
                  {{ venue.courts.length }} sân •
                  {{ venue.pendingBookings }} booking chờ
                </p>
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Quy tắc tự động
            </h3>
            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start space-x-3">
                <span class="text-blue-500">•</span>
                <span>Khóa khung giờ sau 3 booking trùng thời gian.</span>
              </li>
              <li class="flex items-start space-x-3">
                <span class="text-blue-500">•</span>
                <span>
                  Gửi cảnh báo nếu booking không được xác nhận trong 30 phút.
                </span>
              </li>
              <li class="flex items-start space-x-3">
                <span class="text-blue-500">•</span>
                <span>
                  Cho phép owner tạo khuyến mãi nhanh cho khung giờ trống.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-lg shadow p-6" v-if="currentVenue">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 class="text-2xl font-semibold text-gray-900">
                  {{ currentVenue.name }}
                </h2>
                <p class="text-sm text-gray-500">
                  {{ currentVenue.address }} • {{ currentVenue.courts.length }}
                  sân
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  @click="duplicateDayTemplate"
                >
                  Nhân bản lịch
                </button>
                <button
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  @click="saveVenueChanges"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p class="text-sm text-blue-600">Tỉ lệ lấp đầy hôm nay</p>
                <p class="text-2xl font-semibold text-blue-900">
                  {{ currentVenue.metrics.occupancy }}%
                </p>
              </div>
              <div class="bg-green-50 border border-green-100 rounded-lg p-4">
                <p class="text-sm text-green-600">Doanh thu hôm nay</p>
                <p class="text-2xl font-semibold text-green-900">
                  {{ formatCurrency(currentVenue.metrics.revenueToday) }}
                </p>
              </div>
              <div class="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <p class="text-sm text-yellow-600">Booking chờ xử lý</p>
                <p class="text-2xl font-semibold text-yellow-900">
                  {{ currentVenue.pendingBookings }}
                </p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Khung giờ hoạt động
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="slot in currentVenue.timeSlots"
                    :key="slot.id"
                    class="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ slot.day }} • {{ slot.start }} - {{ slot.end }}
                      </p>
                      <p class="text-sm text-gray-500">
                        Giá: {{ formatCurrency(slot.price) }}
                        {{
                          slot.dynamic
                            ? "(Tự động theo tỷ lệ lấp đầy)"
                            : "(Cố định)"
                        }}
                      </p>
                    </div>
                    <label class="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Kích hoạt</span>
                      <input
                        type="checkbox"
                        class="rounded text-blue-600"
                        :checked="slot.active"
                        @change="toggleSlot(slot.id)"
                      />
                    </label>
                  </div>
                </div>
                <div class="mt-4 border border-dashed border-gray-300 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-700 mb-2">
                    Thêm khung giờ mới
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      v-model="newSlot.day"
                      class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option v-for="day in daysOfWeek" :key="day" :value="day">
                        {{ day }}
                      </option>
                    </select>
                    <input
                      v-model="newSlot.start"
                      type="time"
                      class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      v-model="newSlot.end"
                      type="time"
                      class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      v-model.number="newSlot.price"
                      type="number"
                      min="0"
                      class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Giá (VND)"
                    />
                  </div>
                  <div class="flex items-center justify-between mt-3">
                    <label class="flex items-center space-x-2 text-sm text-gray-600">
                      <input
                        v-model="newSlot.dynamic"
                        type="checkbox"
                        class="rounded text-blue-600"
                      />
                      <span>Tự động điều chỉnh giá</span>
                    </label>
                    <button
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                      @click="addTimeSlot"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Booking trong ngày
                </h3>
                <div class="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div
                    v-for="booking in currentVenue.bookings"
                    :key="booking.id"
                    class="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ booking.user }} • {{ booking.court }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ booking.time }} • {{ booking.duration }} phút
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <select
                        v-model="booking.status"
                        class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      <button
                        class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                        @click="editBooking(booking)"
                      >
                        Sửa
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Thông tin sân
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Tên sân
                    </label>
                    <input
                      v-model="currentVenue.name"
                      type="text"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Loại môn thể thao
                    </label>
                    <select
                      v-model="currentVenue.sport"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="football">Bóng đá</option>
                      <option value="badminton">Cầu lông</option>
                      <option value="tennis">Tennis</option>
                    </select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      v-model="currentVenue.description"
                      rows="3"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            Chọn một sân ở danh sách bên trái để bắt đầu quản lý.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

export default {
  name: "VenueScheduleManager",
  setup() {
    const { user, isAdmin } = useAuth();

    const venues = ref([]);
    const selectedVenueId = ref(null);
    const newSlot = ref({
      day: "Thứ 2",
      start: "07:00",
      end: "09:00",
      price: 350000,
      dynamic: false,
    });

    const daysOfWeek = [
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
      "Chủ nhật",
    ];

    const mockVenues = [
      {
        id: 1,
        owner_id: 10,
        name: "Sân bóng đá Linh Trung",
        address: "12 Đường số 8, TP.Thủ Đức",
        status: "active",
        sport: "football",
        description: "Cụm sân cỏ nhân tạo 5 người, có mái che khu nghỉ ngơi.",
        courts: [{ id: 11 }, { id: 12 }],
        pendingBookings: 3,
        metrics: { occupancy: 84, revenueToday: 4500000 },
        timeSlots: [
          {
            id: "slot-1",
            day: "Thứ 2",
            start: "06:00",
            end: "08:00",
            price: 350000,
            dynamic: false,
            active: true,
          },
          {
            id: "slot-2",
            day: "Thứ 2",
            start: "18:00",
            end: "20:00",
            price: 550000,
            dynamic: true,
            active: true,
          },
        ],
        bookings: [
          {
            id: "bk1",
            user: "Nguyễn Văn A",
            court: "Sân số 1",
            time: "18:00 - 20:00",
            duration: 120,
            status: "pending",
          },
          {
            id: "bk2",
            user: "CLB Minh Tâm",
            court: "Sân số 2",
            time: "20:00 - 22:00",
            duration: 120,
            status: "confirmed",
          },
        ],
      },
      {
        id: 2,
        owner_id: 15,
        name: "Cụm sân cầu lông Quận 1",
        address: "25 Nguyễn Trãi, Quận 1",
        status: "active",
        sport: "badminton",
        description: "6 sân tiêu chuẩn BWF, ánh sáng LED.",
        courts: [{ id: 21 }, { id: 22 }, { id: 23 }],
        pendingBookings: 1,
        metrics: { occupancy: 72, revenueToday: 2800000 },
        timeSlots: [
          {
            id: "slot-3",
            day: "Thứ 3",
            start: "08:00",
            end: "10:00",
            price: 180000,
            dynamic: false,
            active: true,
          },
        ],
        bookings: [
          {
            id: "bk3",
            user: "CLB BMT",
            court: "Sân số 4",
            time: "09:00 - 11:00",
            duration: 120,
            status: "confirmed",
          },
        ],
      },
    ];

    const accessibleVenues = computed(() => {
      if (isAdmin.value) {
        return venues.value;
      }
      return venues.value.filter((venue) => venue.owner_id === user.value?.id);
    });

    const currentVenue = computed(() => {
      return accessibleVenues.value.find(
        (venue) => venue.id === selectedVenueId.value
      );
    });

    const loadVenues = () => {
      venues.value = mockVenues;
      if (!selectedVenueId.value && accessibleVenues.value.length > 0) {
        selectedVenueId.value = accessibleVenues.value[0].id;
      }
    };

    const selectVenue = (venueId) => {
      selectedVenueId.value = venueId;
    };

    const toggleSlot = (slotId) => {
      if (!currentVenue.value) return;
      const slot = currentVenue.value.timeSlots.find(
        (item) => item.id === slotId
      );
      if (slot) {
        slot.active = !slot.active;
      }
    };

    const addTimeSlot = () => {
      if (!currentVenue.value) return;
      currentVenue.value.timeSlots.push({
        id: `slot-${Date.now()}`,
        ...newSlot.value,
        active: true,
      });
      newSlot.value = {
        day: "Thứ 2",
        start: "07:00",
        end: "09:00",
        price: 350000,
        dynamic: false,
      };
    };

    const saveVenueChanges = () => {
      console.info("Saving venue changes", currentVenue.value);
    };

    const editBooking = (booking) => {
      console.info("Edit booking", booking);
    };

    const duplicateDayTemplate = () => {
      console.info("Duplicate day template");
    };

    const syncWithCalendar = () => {
      console.info("Sync with Google Calendar");
    };

    const refreshData = () => {
      loadVenues();
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    };

    onMounted(() => {
      loadVenues();
    });

    return {
      user,
      isAdmin,
      venues,
      selectedVenueId,
      currentVenue,
      accessibleVenues,
      daysOfWeek,
      newSlot,
      selectVenue,
      toggleSlot,
      addTimeSlot,
      saveVenueChanges,
      editBooking,
      duplicateDayTemplate,
      syncWithCalendar,
      refreshData,
      formatCurrency,
    };
  },
};
</script>

