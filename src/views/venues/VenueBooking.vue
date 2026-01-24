<template>
  <div class="h-screen bg-gray-50 pb-12">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else-if="venue" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              Đặt sân tại {{ venue.name }}
            </h1>
            <p class="text-gray-600 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                />
              </svg>
              {{ venue.address }}
            </p>
          </div>
          <RouterLink
            :to="`/venues/${venue.id}`"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem chi tiết sân &rarr;
          </RouterLink>
        </div>
      </div>

      <div class="lg:grid lg:grid-cols-3 lg:gap-8">
        <!-- Main Booking Area -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Court Selection -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">1. Chọn sân</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="court in activeCourts"
                :key="court.id"
                @click="selectCourt(court)"
                :class="[
                  'cursor-pointer border rounded-lg p-4 transition-all',
                  selectedCourt?.id === court.id
                    ? 'border-blue-500 bg-blue-200 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-blue-300',
                ]"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3
                      class="font-medium"
                      @click="selectCourt(court)"
                      :class="[
                        selectedCourt?.id === court.id
                          ? 'text-black'
                          : 'text-gray-700'
                      ]"
                    >
                      {{ court.name }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ court.sport.name }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-blue-600">
                      {{ formatCurrency(court.hourly_rate) }}
                    </p>
                    <p class="text-xs text-gray-500">/ giờ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Date & Time Selection -->
          <div v-if="selectedCourt" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">2. Chọn thời gian</h2>

            <!-- Date Picker -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ngày đặt sân
              </label>
              <input
                v-model="bookingDate"
                type="date"
                :min="today"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Time Slots Grid -->
            <div v-if="bookingDate" class="space-y-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-900">
                  Các khung giờ còn trống
                </h3>
                <div class="flex items-center space-x-4 text-sm">
                  <div class="flex items-center">
                    <div
                      class="w-4 h-4 bg-white border border-gray-300 rounded mr-2"
                    ></div>
                    <span class="text-gray-700">Trống</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                    <span class="text-gray-700">Đang chọn</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <span class="text-gray-700">Đã đặt</span>
                  </div>
                </div>
              </div>

              <div v-if="loadingAvailability" class="py-8 text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
                ></div>
                <p class="mt-2 text-gray-500">Đang tải lịch trống...</p>
              </div>

              <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="slot in timeSlots"
                  :key="slot.slot_id"
                  @click="toggleTimeSlot(slot)"
                  :disabled="slot.is_available === 'booked'"
                  :class="[
                    'py-3 px-2 text-sm rounded border transition-colors flex flex-col items-center justify-center',
                    isSelected(slot)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : slot.is_available === 'available'
                      ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
                  ]"
                >
                  <span class="font-medium"
                    >{{ formatTime(slot.start_time) }} -
                    {{ formatTime(slot.end_time) }}</span
                  >
                  <span
                    class="text-xs mt-1"
                    :class="
                      isSelected(slot) ? 'text-blue-100' : 'text-gray-500'
                    "
                  >
                    {{ formatCurrency(slot.price) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Summary Sidebar -->
        <div class="lg:col-span-1 mt-8 lg:mt-0">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 class="text-lg font-semibold mb-4">Thông tin đặt sân</h2>

            <div class="space-y-4">
              <!-- Selected Court Info -->
              <div v-if="selectedCourt" class="pb-4 border-b">
                <p class="text-sm text-gray-500">Sân đã chọn:</p>
                <p class="font-medium text-gray-700">{{ selectedCourt.name }}</p>
                <p class="text-sm text-gray-600">
                  {{ selectedCourt.sport.name }}
                </p>
              </div>

              <!-- Selected Date -->
              <div v-if="bookingDate" class="pb-4 border-b">
                <p class="text-sm text-gray-500">Ngày:</p>
                <p class="font-medium text-gray-700">{{ formatDate(bookingDate) }}</p>
              </div>

              <!-- Selected Slots -->
              <div v-if="selectedSlots.length > 0" class="pb-4 border-b">
                <p class="text-sm text-gray-500 mb-2">Khung giờ:</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="slot in sortedSelectedSlots"
                    :key="slot.slot_id"
                    class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded text-gray-700"
                  >
                    {{ formatTime(slot.start_time) }} -
                    {{ formatTime(slot.end_time) }}
                  </span>
                </div>
              </div>

              <!-- Price Calculation -->
              <div class="pt-2">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600">Số khung giờ:</span>
                  <span class="text-gray-700">{{ selectedSlots.length }}</span>
                </div>
                <div
                  class="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t"
                >
                  <span>Tổng cộng:</span>
                  <span>{{ formatCurrency(totalPrice) }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <button
                @click="confirmBooking"
                :disabled="!canBook"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-md font-medium transition-colors mt-4"
              >
                Xác nhận đặt sân
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Xác nhận thanh toán</h3>
        <p class="text-gray-600 mb-6">
          Bạn đang đặt sân <strong>{{ selectedCourt?.name }}</strong> vào ngày
          <strong>{{ formatDate(bookingDate) }}</strong
          >.
          <br />
          Tổng tiền:
          <strong class="text-blue-600">{{
            formatCurrency(totalPrice)
          }}</strong>
        </p>

        <div class="space-y-3">
          <button
            @click="processBooking('vnpay')"
            class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Thanh toán VNPay
          </button>
          <button
            @click="processBooking('cash')"
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Thanh toán tại sân
          </button>
          <button
            @click="showConfirmModal = false"
            class="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { useApi } from "@/composables/useApi";
import { useBooking } from "@/composables/useBooking";

export default {
  name: "VenueBooking",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const api = useApi();
    const { createBooking } = useBooking();

    // State
    const loading = ref(false);
    const loadingAvailability = ref(false);
    const venue = ref(null);
    const selectedCourt = ref(null);
    const bookingDate = ref("");
    const timeSlots = ref([]);
    const selectedSlots = ref([]);
    const showConfirmModal = ref(false);

    // Computed
    const today = computed(() => new Date().toISOString().split("T")[0]);

    const activeCourts = computed(
      () => venue.value?.courts?.filter((c) => c.is_active) || []
    );

    const sortedSelectedSlots = computed(() => {
      return [...selectedSlots.value].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );
    });

    const totalPrice = computed(() => {
      return selectedSlots.value.reduce(
        (sum, slot) => sum + Number(slot.price),
        0
      );
    });

    const canBook = computed(
      () =>
        selectedCourt.value &&
        bookingDate.value &&
        selectedSlots.value.length > 0
    );

    // Methods
    const loadVenue = async (id) => {
      try {
        loading.value = true;
        const response = await api.getVenue(id);
        venue.value = response.data.data;

        // Pre-select court if in query
        if (route.query.court_id) {
          const court = venue.value.courts.find(
            (c) => c.id == route.query.court_id
          );
          if (court && court.is_active) {
            selectedCourt.value = court;
          }
        }
      } catch (error) {
        console.error("Failed to load venue:", error);
        router.push("/venues");
      } finally {
        loading.value = false;
      }
    };

    const loadAvailability = async () => {
      if (!selectedCourt.value || !bookingDate.value) return;

      try {
        loadingAvailability.value = true;
        selectedSlots.value = [];

        const response = await api.getCourtAvailability(
          selectedCourt.value.id,
          bookingDate.value
        );

        // API returns array of slots directly
        timeSlots.value = response.data.data || [];
      } catch (error) {
        console.error("Failed to load availability:", error);
        timeSlots.value = [];
      } finally {
        loadingAvailability.value = false;
      }
    };

    const selectCourt = (court) => {
      selectedCourt.value = court;
      selectedSlots.value = [];
    };

    const toggleTimeSlot = (slot) => {
      const index = selectedSlots.value.findIndex(
        (s) => s.slot_id === slot.slot_id
      );
      if (index === -1) {
        selectedSlots.value.push(slot);
      } else {
        selectedSlots.value.splice(index, 1);
      }
    };

    const isSelected = (slot) => {
      return selectedSlots.value.some((s) => s.slot_id === slot.slot_id);
    };

    const confirmBooking = () => {
      if (!store.getters["auth/isAuthenticated"]) {
        router.push({
          path: "/auth/login",
          query: { redirect: route.fullPath },
        });
        return;
      }
      showConfirmModal.value = true;
    };

    const processBooking = async (paymentMethod) => {
      try {
        loading.value = true;
        showConfirmModal.value = false;

        // Sort slots to find contiguous blocks
        const sorted = sortedSelectedSlots.value;
        const startTime = sorted[0].start_time;
        const endTime = sorted[sorted.length - 1].end_time;

        const bookingData = {
          venue_id: venue.value.id,
          court_id: selectedCourt.value.id,
          booking_date: bookingDate.value,
          start_time: startTime,
          end_time: endTime,
          payment_method: paymentMethod,
          notes: "", // Optional
        };

        const result = await createBooking(bookingData);

        if (result.success) {
          // Redirect to booking detail or payment
          if (paymentMethod === "vnpay") {
            // Handle VNPay redirect
            // const paymentUrl = result.data.payment_url;
            // window.location.href = paymentUrl;
            router.push(`/bookings/${result.data.id}`);
          } else {
            router.push(`/bookings/${result.data.id}`);
          }
        } else {
          alert(result.error || "Đặt sân thất bại");
        }
      } catch (error) {
        console.error("Booking failed:", error);
        alert("Có lỗi xảy ra khi đặt sân");
      } finally {
        loading.value = false;
      }
    };

    // Formatters
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Watchers
    watch([() => selectedCourt.value, () => bookingDate.value], () => {
      if (selectedCourt.value && bookingDate.value) {
        loadAvailability();
      }
    });

    // Initialize
    onMounted(() => {
      const venueId = route.params.id;
      if (venueId) {
        loadVenue(venueId);
      }

      if (route.query.date) {
        bookingDate.value = route.query.date;
      } else {
        bookingDate.value = today.value;
      }
    });

    const formatTime = (timeString) => {
      if (!timeString) return "";
      return timeString.substring(0, 5);
    };

    return {
      loading,
      loadingAvailability,
      venue,
      activeCourts,
      selectedCourt,
      bookingDate,
      today,
      timeSlots,
      selectedSlots,
      sortedSelectedSlots,
      totalPrice,
      canBook,
      showConfirmModal,
      selectCourt,
      toggleTimeSlot,
      isSelected,
      confirmBooking,
      processBooking,
      formatCurrency,
      formatDate,
      formatTime,
    };
  },
};
</script>
