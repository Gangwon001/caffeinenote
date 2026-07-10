"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    `/login?message=${encodeURIComponent("확인 이메일을 보냈어요. 메일함을 확인한 뒤 로그인해주세요.")}`,
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function findAccount(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    redirect(`/find-account?error=${encodeURIComponent("확인 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.")}`);
  }

  const exists = data.users.some((u) => u.email?.toLowerCase() === email);

  if (exists) {
    redirect(
      `/find-account?message=${encodeURIComponent(`가입된 계정을 찾았어요. 아이디는 이메일 주소인 ${email} 입니다.`)}`,
    );
  }

  redirect(`/find-account?error=${encodeURIComponent("가입된 계정을 찾을 수 없어요.")}`);
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/forgot-password?message=${encodeURIComponent("비밀번호 재설정 링크를 이메일로 보냈어요. 메일함을 확인해주세요.")}`,
  );
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("비밀번호가 변경되었어요. 새 비밀번호로 로그인해주세요.")}`,
  );
}

export async function changePassword(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    redirect(`/account?pwError=${encodeURIComponent("현재 비밀번호가 일치하지 않아요.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/account?pwError=${encodeURIComponent(error.message)}`);
  }

  redirect(`/account?pwMessage=${encodeURIComponent("비밀번호가 변경되었어요.")}`);
}
