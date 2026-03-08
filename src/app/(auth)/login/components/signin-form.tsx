"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState, Suspense } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DialogHeader } from "@/components/ui/dialog";

const SignInSchema = z.object({
  email: z.email("Email inválido").trim(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").trim(),
});

type SignInForm = z.infer<typeof SignInSchema>;

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();

  const onSubmit = async (data: SignInForm) => {
    await signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success("Login realizado com sucesso!");
        },
        onError: () => {
          setLoading(false);
          toast.error("Erro ao realizar login. Verifique suas credenciais.");
        }
      },
    );
  };

  function SuspensaoAviso() {

    useEffect(() => {
      const error = searchParams.get("error");

      if (error === "account_suspended") {
        toast.error("Acesso Negado", {
          description:
            "Asua conta foi desativada pelo administrador. Contate o suporte.",
          duration: 6000,
        });
      }
    }, [searchParams]);

    return null;
  }

  const handleSignInWithGoogle = async () => {
    await signIn.social(
      {
        provider: "google",
        callbackURL: "/dashdoard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success("Redirecionando para login com Google...");
        },
        onError: () => {
          setLoading(false);
          toast.error("Erro ao realizar login. Verifique suas credenciais.");
        },
      },
    );
  };

  return (
    <DialogHeader>
      <Suspense fallback={null}>
        <SuspensaoAviso />
      </Suspense>
      <Card className="min-w-xs sm:min-w-sm">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Entrar</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Insira seu e-mail abaixo para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="fulano@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              {...field}
                              type={passwordVisible ? "text" : "password"}
                              placeholder="senha"
                              className="pr-8"
                            />
                            {passwordVisible ? (
                              <Eye
                                size={15}
                                className="absolute right-3 top-3 cursor-pointer"
                                onClick={() =>
                                  setPasswordVisible(!passwordVisible)
                                }
                              />
                            ) : (
                              <EyeOff
                                size={15}
                                className="absolute right-3 top-3 cursor-pointer"
                                onClick={() =>
                                  setPasswordVisible(!passwordVisible)
                                }
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <p> Entrar </p>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <Link
            href="/register"
            className="my-4 inline-block text-sm underline"
          >
            Não tem uma conta? Registre-se
          </Link>
          <div
            className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col",
            )}
          >
            <Button
              variant="outline"
              className={cn("w-full gap-2")}
              disabled={loading}
              onClick={handleSignInWithGoogle}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Entrar com Google
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t py-4">
            <p className="text-center text-xs text-neutral-500">
              feito por <span className="text-orange-400">HawkDev.</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </DialogHeader>
  );
}
