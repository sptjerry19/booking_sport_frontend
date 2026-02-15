<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Báo cáo doanh thu</h1>
          <p class="mt-2 text-gray-600">
            Theo dõi doanh thu, công suất sân và hiệu quả theo từng khung giờ
            trên toàn hệ thống.
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <select
            v-model="filters.range"
            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
          <button
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            @click="exportReport"
          >
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Tổng doanh thu</p>
          <p class="text-3xl font-semibold text-gray-900 mt-2">
            {{ formatCurrency(summary.totalRevenue) }}
          </p>
          <p class="text-xs text-green-600 mt-1">+12% so với kỳ trước</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Số booking</p>
          <p class="text-3xl font-semibold text-gray-900 mt-2">
            {{ summary.totalBookings }}
          </p>
          <p class="text-xs text-green-600 mt-1">+7% so với kỳ trước</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Tỉ lệ lấp đầy</p>
          <p class="text-3xl font-semibold text-gray-900 mt-2">
            {{ summary.occupancy }}%
          </p>
          <p class="text-xs text-gray-500 mt-1">Giờ vàng đạt 93%</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500">Giá trị trung bình</p>
          <p class="text-3xl font-semibold text-gray-900 mt-2">
            {{ formatCurrency(summary.avgTicket) }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Mỗi booking</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              Doanh thu theo ngày
            </h2>
            <select
              v-model="filters.venueId"
              class="border border-gray-200 rounded-md px-3 py-1 text-sm focus:outline-none"
            >
              <option value="all">
                {{ isAdmin ? "Tất cả sân" : "Tất cả sân tôi quản lý" }}
              </option>
              <option
                v-for="venue in accessibleVenues"
                :key="venue.id"
                :value="venue.id"
              >
                {{ venue.name }}
              </option>
            </select>
          </div>
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div
                class="w-16 h-16 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-semibold"
              >
                ⟳
              </div>
              <p class="text-gray-600 text-sm">
                Biểu đồ sẽ hiển thị khi tích hợp thư viện chart (ví dụ:
                Chart.js, ApexCharts).
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Doanh thu theo khung giờ
          </h2>
          <ul class="space-y-3">
            <li
              v-for="slot in summary.revenueBySlot"
              :key="slot.label"
              class="flex items-center justify-between text-sm text-gray-600"
            >
              <span>{{ slot.label }}</span>
              <span class="font-semibold text-gray-900">{{
                formatCurrency(slot.value)
              }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Doanh thu theo sân
            </h3>
            <button
              class="text-sm text-blue-600 hover:text-blue-700"
              @click="sortVenues"
            >
              Sắp xếp theo doanh thu
            </button>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sân
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công suất
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="venue in revenueByVenue" :key="venue.id">
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-gray-900">
                    {{ venue.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ venue.bookings }} booking
                  </p>
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  {{ formatCurrency(venue.revenue) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <span
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="occupancyClass(venue.occupancy)"
                  >
                    {{ venue.occupancy }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Nguồn doanh thu
          </h3>
          <ul class="space-y-4">
            <li
              v-for="source in summary.revenueSources"
              :key="source.label"
              class="flex items-center justify-between text-sm text-gray-600"
            >
              <div>
                <p class="font-medium text-gray-900">{{ source.label }}</p>
                <p class="text-xs text-gray-500">{{ source.description }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">
                  {{ formatCurrency(source.value) }}
                </p>
                <p class="text-xs text-gray-500">{{ source.percent }}%</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

export default {
  name: "ReportsDashboard",
  setup() {
    const { user, isAdmin } = useAuth();

    const filters = ref({
      range: "30d",
      venueId: "all",
    });

    const venues = ref([]);
    const summary = ref({
      totalRevenue: 145000000,
      totalBookings: 326,
      occupancy: 81,
      avgTicket: 445000,
      revenueBySlot: [
        { label: "05:00 - 08:00", value: 12000000 },
        { label: "08:00 - 16:00", value: 18000000 },
        { label: "16:00 - 22:00", value: 92000000 },
      ],
      revenueSources: [
        {
          label: "Đặt sân trực tiếp",
          description: "Người dùng đặt qua app/web",
          value: 118000000,
          percent: 81,
        },
        {
          label: "Thu hộ owner",
          description: "Owner quản lý đặt sân nội bộ",
          value: 19000000,
          percent: 13,
        },
        {
          label: "Tiện ích bổ sung",
          description: "Đồ uống, thuê dụng cụ, dịch vụ",
          value: 8000000,
          percent: 6,
        },
      ],
    });

    const revenueByVenue = ref([]);

    const mockVenues = [
      {
        id: 1,
        owner_id: 10,
        name: "Sân bóng đá Linh Trung",
        revenue: 58000000,
        bookings: 92,
        occupancy: 88,
      },
      {
        id: 2,
        owner_id: 15,
        name: "Cụm sân cầu lông Quận 1",
        revenue: 32000000,
        bookings: 110,
        occupancy: 74,
      },
      {
        id: 3,
        owner_id: 10,
        name: "Sân tennis Riverside",
        revenue: 25000000,
        bookings: 46,
        occupancy: 69,
      },
    ];

    const accessibleVenues = computed(() => {
      if (isAdmin.value) {
        return venues.value;
      }
      return venues.value.filter((venue) => venue.owner_id === user.value?.id);
    });

    const loadReport = () => {
      venues.value = mockVenues;
      revenueByVenue.value = accessibleVenues.value;
    };

    const sortVenues = () => {
      revenueByVenue.value = [...revenueByVenue.value].sort(
        (a, b) => b.revenue - a.revenue
      );
    };

    const occupancyClass = (value) => {
      if (value > 85) return "bg-green-100 text-green-700";
      if (value > 70) return "bg-yellow-100 text-yellow-700";
      return "bg-red-100 text-red-700";
    };

    const exportReport = () => {
      console.info("Export current report", filters.value);
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    };

    onMounted(() => {
      loadReport();
    });

    return {
      user,
      isAdmin,
      filters,
      summary,
      revenueByVenue,
      accessibleVenues,
      occupancyClass,
      sortVenues,
      exportReport,
      formatCurrency,
    };
  },
};
</script>

