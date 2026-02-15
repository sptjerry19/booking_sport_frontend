import { useAuth } from "@/composables/useAuth";

export default function adminMiddleware(to: any, from: any, next: any) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated.value) {
    next("/auth/login");
    return;
  }

  if (!user.value?.roles?.includes("admin")) {
    next({
      path: "/",
      query: {
        error: "access_denied",
        message: "Chỉ quản trị viên mới được phép truy cập trang này",
      },
    });
    return;
  }

  next();
}
