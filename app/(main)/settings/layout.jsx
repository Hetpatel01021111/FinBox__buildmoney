import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }) {
  return (
    <div className="container max-w-7xl py-10">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Settings
      </h1>
      <p className="text-gray-500 mb-8">
        Manage your FinBox account settings and preferences
      </p>
      
      <Tabs defaultValue="api-token" className="mb-8">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <Link href="/settings/api-token" passHref>
            <TabsTrigger value="api-token">API Token</TabsTrigger>
          </Link>
          <Link href="/settings/profile" passHref>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      
      {children}
    </div>
  );
}
