import SignUp from "./components/signup-form";

const RegisterPage = async () => {
  return (
    <div className="flex flex-col w-full min-h-dvh justify-center items-center">
      <SignUp />
    </div>
  );
};

export default RegisterPage;
