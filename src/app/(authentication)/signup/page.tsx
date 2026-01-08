import Link from "next/link"
import { SignupForm } from "./_components/signup-form"

export default function Signup() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 -4 dark:bg-gray-900 text-white">
      <div className="w-full max-w-md space-y-8 border border-white/10 pb-12 p-20 rounded-lg bg-gray-700 backdrop-blur">
        <div className="text-center">
          <h1 className="text-3xl text-white font-bold">Cadastro</h1>
          <p className="mt-2 text-white text-sm text-muted-foreground">Crie sua conta para começar</p>
        </div>

        <SignupForm />

        <div className="text-center text-white text-sm">
          <p>
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary text-white hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
