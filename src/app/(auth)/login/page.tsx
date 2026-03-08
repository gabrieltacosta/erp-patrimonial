import SignIn from "./components/signin-form";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <div className="flex flex-col w-full h-dvh items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-sm h-96 animate-pulse bg-slate-200 rounded-lg"></div>
        }
      >
        <SignIn />
      </Suspense>
    </div>
  );
};

export default LoginPage;
