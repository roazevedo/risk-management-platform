import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/src/app/(authentication)/login/_components/login-form"
import { ShieldCheck, Target, ClipboardList, BarChart3 } from "lucide-react"

export default function Login() {
  return (
    <div className="flex min-h-screen dark:bg-gray-900">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="mb-10">
          <Image
            src="/Logo_CGM_Branco.png"
            alt="CGM-Rio"
            width={220}
            height={80}
            className="object-contain"
          />
        </div>

        <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
          Plataforma de Gestão de Riscos
        </h1>

        <p className="text-lg text-gray-300 mb-10 leading-relaxed">
          Sistema integrado para identificação, avaliação e monitoramento de riscos
          nos processos de trabalho da Controladoria-Geral do Município do Rio de Janeiro.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-lg">
              <ClipboardList className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Gestão de Processos</h3>
              <p className="text-gray-400 text-sm">
                Cadastre e gerencie os processos de trabalho de cada setor da organização.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600/20 rounded-lg">
              <Target className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Identificação de Riscos</h3>
              <p className="text-gray-400 text-sm">
                Identifique riscos, suas causas e consequências com metodologia estruturada.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Controles Internos</h3>
              <p className="text-gray-400 text-sm">
                Defina e acompanhe controles para mitigar os riscos identificados.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-600/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Relatórios e Dashboards</h3>
              <p className="text-gray-400 text-sm">
                Visualize métricas e gere relatórios completos por setor.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-900">
        <div className="lg:hidden mb-8">
          <Image
            src="/Logo_CGM_Branco.png"
            alt="CGM-Rio"
            width={180}
            height={60}
            className="object-contain"
          />
        </div>

        <div className="w-full max-w-md space-y-8 border border-white/10 p-10 rounded-xl bg-gray-800/50 backdrop-blur shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl text-white font-bold">Bem-vindo</h2>
            <p className="mt-2 text-gray-400 text-sm">
              Faça login para acessar a plataforma
            </p>
          </div>

          <LoginForm />

          <div className="text-center text-sm">
            <p className="text-gray-400">
              Ainda não tem uma conta?{" "}
              <Link
                href="/signup"
                className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-gray-500 text-xs text-center">
          © {new Date().getFullYear()} Controladoria-Geral do Município do Rio de Janeiro
        </p>
      </div>
    </div>
  )
}
