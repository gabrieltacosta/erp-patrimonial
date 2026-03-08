"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Loader2, X, Building2, User } from "lucide-react"; // Adicionado Building2 e User
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Importe a Server Action que criamos
import { setupEmpresaAction } from "@/app/(auth)/register/actions";

const SignUpSchema = z
  .object({
    // Novos campos da Empresa
    nomeEmpresa: z.string().min(3, "Nome da empresa é obrigatório").trim(),
    cnpj: z.string().min(14, "CNPJ é obrigatório").trim(),

    // Seus campos originais
    firstName: z.string().min(1, "Nome é obrigatório").trim(),
    lastName: z.string().min(1, "Sobrenome é obrigatório").trim(),
    email: z.email("Email inválido").trim(),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .trim(),
    passwordConfirmation: z
      .string()
      .min(1, "Confirmar Senha é obrigatório")
      .trim(),
  })
  .superRefine(({ password, passwordConfirmation }, ctx) => {
    if (password !== passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem",
        path: ["passwordConfirmation"],
      });
    }
  });

type SignUpForm = z.infer<typeof SignUpSchema>;

export default function SignUp() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const form = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      nomeEmpresa: "",
      cnpj: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    await signUp.email({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`, // O Better Auth junta o nome aqui
      image: image ? await convertImageToBase64(image) : "",
      callbackURL: "/login",
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message === "User already exists. Use another email."
              ? "Email já cadastrado!"
              : ctx.error.message,
          );
          setLoading(false);
        },
        // MÁGICA AQUI: O onSuccess agora é async para rodarmos a Action do Banco
        onSuccess: async () => {
          try {
            const setupResult = await setupEmpresaAction({
              nomeEmpresa: data.nomeEmpresa,
              cnpj: data.cnpj,
            });

            if (setupResult?.error) {
              toast.error(setupResult.error);
              setLoading(false);
              return;
            }

            toast.success("Conta corporativa criada com sucesso!");
            router.push("/dashboard");
          } catch (error) {
            toast.error("Ocorreu um erro ao configurar a empresa.");
          } finally {
            setLoading(false);
          }
        },
      },
    });
  };

  const handleSignInWithGoogle = async () => {
    await signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
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
    <Card className="z-50 rounded-md rounded-t-none w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Cadastrar Empresa</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Insira as informações da empresa e do administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {/* SESSÃO: DADOS DA EMPRESA */}
              <div className="space-y-4 bg-slate-50 p-3 rounded-lg border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Dados da Empresa
                </h3>

                <FormField
                  control={form.control}
                  name="nomeEmpresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa (Razão Social)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Sua Empresa Ltda" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="00.000.000/0001-00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SESSÃO: DADOS DO ADMINISTRADOR */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> Perfil do Administrador
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="João" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Silva" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Corporativo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="joao@empresa.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            placeholder="Senha"
                            className="pr-8"
                          />
                          {passwordVisible ? (
                            <Eye
                              size={15}
                              className="absolute right-3 top-3 cursor-pointer text-slate-400"
                              onClick={() =>
                                setPasswordVisible(!passwordVisible)
                              }
                            />
                          ) : (
                            <EyeOff
                              size={15}
                              className="absolute right-3 top-3 cursor-pointer text-slate-400"
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

                <FormField
                  control={form.control}
                  name="passwordConfirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Input
                            {...field}
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Senha"
                            className="pr-8"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-2">
                  <Label htmlFor="image">Imagem de Perfil (opcional)</Label>
                  <div className="flex items-end gap-4">
                    {imagePreview && (
                      <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Prévia"
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-slate-500 cursor-pointer"
                      />
                      {imagePreview && (
                        <X
                          className="cursor-pointer text-slate-500 hover:text-red-500"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Criar Sistema Corporativo"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <Link
          href="/login"
          className="my-4 inline-block text-sm underline text-slate-500 hover:text-slate-800"
        >
          Já tem uma conta? Faça login
        </Link>

        <div
          className={cn(
            "w-full gap-2 flex items-center justify-between flex-col",
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
          <span className="text-center text-xs text-neutral-500">
            Protegido por <span className="text-orange-400">HawkDev.</span>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
