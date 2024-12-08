import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import AdminProductForm from "@/components/AdminProductForm"

export default function AdminStore() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Store Management</h1>
      <AdminProductForm />
    </div>
  )
}
