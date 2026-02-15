<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-wide text-yellow-600 font-semibold">
            Admin only
          </p>
          <h1 class="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p class="mt-2 text-gray-600">
            Quản trị hệ thống, phân quyền owner và theo dõi hoạt động
          </p>
        </div>
        <button
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          @click="inviteOwner"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm5-4v3h3v2h-3v3h-2v-3h-3v-2h3V8h2z"
            />
          </svg>
          Mời owner mới
        </button>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
        <h3 class="text-lg font-semibold text-blue-900 mb-2">
          Nguyên tắc phân quyền
        </h3>
        <ul class="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Admin thao tác trên toàn bộ sân trong hệ thống.</li>
          <li>Owner chỉ được phép chỉnh sửa các sân mà họ được chỉ định.</li>
          <li>
            Có thể gán nhiều owner cho một sân giúp phân tách trách nhiệm vận
            hành.
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Tìm kiếm</label
            >
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tên, email, số điện thoại..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Vai trò</label
            >
            <select
              v-model="filters.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="user">Khách đặt sân</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Trạng thái</label
            >
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ xác minh</option>
              <option value="blocked">Đã khóa</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              @click="resetFilters"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-lg shadow">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="text-lg font-semibold text-gray-900">
              Danh sách người dùng
            </h2>
            <span class="text-sm text-gray-500"
              >{{ filteredUsers.length }} kết quả</span
            >
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sân quản lý
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="userItem in filteredUsers"
                  :key="userItem.id"
                  :class="[
                    selectedUser?.id === userItem.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50',
                  ]"
                >
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900">
                      {{ userItem.name }}
                    </p>
                    <p class="text-sm text-gray-500">{{ userItem.email }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="role in userItem.roles"
                        :key="role"
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="roleBadgeClass(role)"
                      >
                        {{ roleLabel(role) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-sm text-gray-600">
                      {{
                        userItem.managed_venues.length
                          ? userItem.managed_venues.join(", ")
                          : "—"
                      }}
                    </p>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      @click="selectUser(userItem)"
                    >
                      Cấu hình
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Cấu hình chi tiết
          </h3>

          <div v-if="!selectedUser" class="text-sm text-gray-500">
            Chọn một người dùng ở bảng bên trái để chỉnh sửa quyền.
          </div>

          <div v-else class="space-y-6">
            <div class="border-b border-gray-100 pb-4">
              <p class="text-lg font-semibold text-gray-900">
                {{ selectedUser.name }}
              </p>
              <p class="text-sm text-gray-500">{{ selectedUser.email }}</p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Vai trò hệ thống
              </h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="role in systemRoles"
                  :key="role.value"
                  :class="[
                    'px-3 py-1 text-sm rounded-full border transition-colors',
                    selectedUser.roles.includes(role.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-600 border-gray-200 hover:border-gray-400',
                  ]"
                  @click="toggleRole(role.value)"
                >
                  {{ role.label }}
                </button>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Sân được phép quản lý
              </h4>
              <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                <label
                  v-for="venue in venues"
                  :key="venue.id"
                  class="flex items-center space-x-3 text-sm text-gray-600"
                >
                  <input
                    type="checkbox"
                    class="rounded text-blue-600 focus:ring-blue-500"
                    :checked="selectedUser.venue_ids.includes(venue.id)"
                    @change="toggleVenueAccess(venue.id)"
                    :disabled="selectedUser.roles.includes('admin')"
                  />
                  <span>{{ venue.name }}</span>
                </label>
              </div>
              <p
                v-if="selectedUser.roles.includes('admin')"
                class="text-xs text-gray-500 mt-2"
              >
                Admin mặc định có quyền trên tất cả sân.
              </p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Thông báo hoạt động
              </h4>
              <label class="flex items-center text-sm text-gray-600 space-x-3">
                <input
                  v-model="selectedUser.alerts.booking"
                  type="checkbox"
                  class="rounded text-blue-600"
                />
                <span>Cảnh báo khi có booking bị hủy</span>
              </label>
              <label class="flex items-center text-sm text-gray-600 space-x-3">
                <input
                  v-model="selectedUser.alerts.revenue"
                  type="checkbox"
                  class="rounded text-blue-600"
                />
                <span>Gửi báo cáo doanh thu hàng tuần</span>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <button
                class="text-sm text-red-600 hover:text-red-700"
                @click="blockUser"
              >
                Khóa tài khoản
              </button>
              <button
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                @click="saveUserChanges"
              >
                Lưu thay đổi
              </button>
            </div>
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
  name: "ManageUsers",
  setup() {
    const api = useApi();
    const { user } = useAuth();

    const loading = ref(false);
    const filters = ref({
      search: "",
      role: "all",
      status: "all",
    });

    const users = ref([]);
    const venues = ref([]);
    const selectedUser = ref(null);

    const systemRoles = [
      { label: "Admin", value: "admin" },
      { label: "Owner", value: "owner" },
      { label: "Khách đặt sân", value: "user" },
    ];

    const mockVenues = [
      { id: 1, name: "Sân bóng đá Thủ Đức" },
      { id: 2, name: "Cụm sân cầu lông Quận 1" },
      { id: 3, name: "Sân tennis Riverside" },
      { id: 4, name: "Sân bóng rổ Nhà Văn Hóa" },
    ];

    const mockUsers = [
      {
        id: 1,
        name: "Nguyễn Văn An",
        email: "an.nguyen@example.com",
        roles: ["admin"],
        status: "active",
        managed_venues: mockVenues.map((v) => v.name),
        venue_ids: mockVenues.map((v) => v.id),
        alerts: { booking: true, revenue: true },
      },
      {
        id: 2,
        name: "Trần Thị Bình",
        email: "binh.tran@example.com",
        roles: ["owner"],
        status: "active",
        managed_venues: [mockVenues[0].name, mockVenues[2].name],
        venue_ids: [1, 3],
        alerts: { booking: true, revenue: false },
      },
      {
        id: 3,
        name: "Lê Hoàng",
        email: "hoang.le@example.com",
        roles: ["owner"],
        status: "pending",
        managed_venues: [mockVenues[1].name],
        venue_ids: [2],
        alerts: { booking: false, revenue: false },
      },
      {
        id: 4,
        name: "Phạm Thảo",
        email: "thao.pham@example.com",
        roles: ["user"],
        status: "active",
        managed_venues: [],
        venue_ids: [],
        alerts: { booking: false, revenue: false },
      },
    ];

    const filteredUsers = computed(() => {
      return users.value.filter((item) => {
        const byRole =
          filters.value.role === "all" ||
          item.roles.includes(filters.value.role);
        const byStatus =
          filters.value.status === "all" || item.status === filters.value.status;
        const bySearch =
          filters.value.search.trim().length === 0 ||
          item.name
            .toLowerCase()
            .includes(filters.value.search.toLowerCase()) ||
          item.email
            .toLowerCase()
            .includes(filters.value.search.toLowerCase());
        return byRole && byStatus && bySearch;
      });
    });

    const loadUsers = async () => {
      try {
        loading.value = true;
        // const response = await api.getUsers();
        // users.value = response.data.data;
        users.value = mockUsers;
        venues.value = mockVenues;
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        loading.value = false;
      }
    };

    const selectUser = (userItem) => {
      selectedUser.value = JSON.parse(JSON.stringify(userItem));
    };

    const resetFilters = () => {
      filters.value = { search: "", role: "all", status: "all" };
    };

    const toggleRole = (role) => {
      if (!selectedUser.value) return;
      const roles = selectedUser.value.roles;
      if (roles.includes(role)) {
        selectedUser.value.roles = roles.filter((r) => r !== role);
      } else {
        selectedUser.value.roles = [...roles, role];
      }
      if (selectedUser.value.roles.includes("admin")) {
        selectedUser.value.venue_ids = venues.value.map((v) => v.id);
      }
    };

    const toggleVenueAccess = (venueId) => {
      if (!selectedUser.value) return;
      const venueIds = selectedUser.value.venue_ids;
      if (venueIds.includes(venueId)) {
        selectedUser.value.venue_ids = venueIds.filter((id) => id !== venueId);
      } else {
        selectedUser.value.venue_ids = [...venueIds, venueId];
      }
    };

    const saveUserChanges = async () => {
      if (!selectedUser.value) return;
      try {
        loading.value = true;
        // await api.updateUser(selectedUser.value.id, selectedUser.value);
        const index = users.value.findIndex(
          (u) => u.id === selectedUser.value.id
        );
        if (index !== -1) {
          const managedNames = venues.value
            .filter((venue) => selectedUser.value.venue_ids.includes(venue.id))
            .map((venue) => venue.name);
          users.value.splice(index, 1, {
            ...selectedUser.value,
            managed_venues: managedNames,
          });
        }
      } catch (error) {
        console.error("Failed to save user:", error);
      } finally {
        loading.value = false;
      }
    };

    const inviteOwner = () => {
      console.info("Invite owner modal should appear here");
    };

    const blockUser = () => {
      if (!selectedUser.value) return;
      selectedUser.value.status = "blocked";
    };

    const roleBadgeClass = (role) => {
      const classes = {
        admin: "bg-purple-100 text-purple-800",
        owner: "bg-blue-100 text-blue-800",
        user: "bg-gray-100 text-gray-800",
      };
      return classes[role] || "bg-gray-100 text-gray-800";
    };

    const roleLabel = (role) => {
      const map = {
        admin: "Admin",
        owner: "Owner",
        user: "Khách đặt sân",
      };
      return map[role] || role;
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      user,
      loading,
      filters,
      users,
      venues,
      selectedUser,
      systemRoles,
      filteredUsers,
      selectUser,
      resetFilters,
      toggleRole,
      toggleVenueAccess,
      saveUserChanges,
      inviteOwner,
      blockUser,
      roleBadgeClass,
      roleLabel,
    };
  },
};
</script>

