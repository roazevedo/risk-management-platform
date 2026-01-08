"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Save, Loader2, Mail, Building, CreditCard, Calendar } from "lucide-react";
import Sidebar from "@/src/components/ui/Sidebar";
import { authClient, User as UserType } from "@/src/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Estado do Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: "",
    sector: "",
    registration: "",
  });

  // Carregar dados do usuário quando a sessão estiver disponível
  useEffect(() => {
    if (session?.user) {
      const user = session.user as UserType;
      setFormData({
        name: user.name || "",
        sector: user.sector || "",
        registration: user.registration || "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await authClient.updateUser({
        name: formData.name,
        ...({ sector: formData.sector, registration: formData.registration } as any),
      });

      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
      setIsEditing(false);

      // Recarrega a sessão para atualizar os dados
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setMessage({ type: 'error', text: 'Erro ao atualizar os dados. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (session?.user) {
      const user = session.user as UserType;
      setFormData({
        name: user.name || "",
        sector: user.sector || "",
        registration: user.registration || "",
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (isPending) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </main>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const user = session.user as UserType;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meu Perfil
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Visualize e edite suas informações pessoais
            </p>
          </div>

          {/* Card do Perfil */}
          <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-indigo-200">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {/* Mensagem de feedback */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Informações do usuário */}
              <div className="space-y-6">
                {/* Email (não editável) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                    {user.email}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                {/* Nome */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <User className="w-4 h-4" />
                    Nome completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                      {user.name || "Não informado"}
                    </div>
                  )}
                </div>

                {/* Setor */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <Building className="w-4 h-4" />
                    Setor
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: CG/ADS/GRH"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                      {(user as UserType).sector || "Não informado"}
                    </div>
                  )}
                </div>

                {/* Matrícula */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <CreditCard className="w-4 h-4" />
                    Matrícula
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="registration"
                      value={formData.registration}
                      onChange={handleChange}
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Sua matrícula"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                      {(user as UserType).registration || "Não informada"}
                    </div>
                  )}
                </div>

                {/* Data de cadastro */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    Membro desde
                  </label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : "Data não disponível"
                    }
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="mt-8 flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar alterações
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Editar informações
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
