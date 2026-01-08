"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { authClient } from "@/src/lib/auth-client"

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(formData: LoginFormValues) {
    const {} = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
      callbackURL: "/dashboard",
    }, {
      onRequest: () => {
        setIsLoading(true)
      },
      onSuccess: () => {
        router.replace("/dashboard")
      },

      onError: (ctx) => {
        setIsLoading(false)
        const message = ctx.error?.message || ""

        if (message.includes("user") || message.includes("not found")) {
          form.setError("root", { message: "Usuário não encontrado" })
        } else if (message.includes("password") || message.includes("Invalid")) {
          form.setError("root", { message: "Senha incorreta" })
        } else {
          form.setError("root", { message: "Erro ao fazer login" })
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="seu@email.com"
                  type="email"
                  {...field}
                  disabled={isLoading}
                  className="text-gray-400 placeholder:text-gray-400"
                />
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
              <FormLabel className="text-gray-400">Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    {...field}
                    disabled={isLoading}
                    className="text-gray-400 placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 hover:h-5 hover:w-5 hover:delay text-muted-foreground cursor-pointer text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 hover:h-5 hover:w-5 hover:delay text-muted-foreground cursor-pointer text-gray-400" />
                    )}
                    <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gray-400 hover:bg-gray-500 cursor-pointer font-bold"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        {form.formState.errors.root && (
          <p className="text-sm text-red-500 text-center">
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </Form>
  )
}
