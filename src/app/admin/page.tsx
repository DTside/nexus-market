"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, Users, DollarSign, Package, Plus, TrendingUp, Search, UserCheck, Wallet } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Статистика
  const [stats, setStats] = useState({ users: 0, sales: 0, revenue: 0 });
  const [popularItems, setPopularItems] = useState<any[]>([]); // По просмотрам
  const [topSellingItems, setTopSellingItems] = useState<any[]>([]); // По продажам
  const [usersList, setUsersList] = useState<any[]>([]); // Список юзеров

  // Форма добавления
  const [newItem, setNewItem] = useState({
    name: '', type: 'Art', price: '', rarity: 'Common', image_url: '', description: ''
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.is_admin) {
        alert("ACCESS DENIED: ADMIN CLEARANCE REQUIRED");
        router.push("/");
        return;
      }
      fetchStats();
    };
    checkAdmin();
  }, [router]);

  const fetchStats = async () => {
    // 1. ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ (КОНТРОЛЬ)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('credits', { ascending: false }); // Сортируем по богатству
    
    if (profiles) {
        setUsersList(profiles);
        setStats(prev => ({ ...prev, users: profiles.length }));
    }

    // 2. ЗАГРУЗКА ТРАНЗАКЦИЙ (ДЛЯ ГРАФИКА ПРОДАЖ)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('price_at_purchase, items(name)');
    
    // Считаем выручку
    const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.price_at_purchase), 0) || 0;
    
    // Считаем продажи по каждому товару
    const salesMap: Record<string, number> = {};
    transactions?.forEach((tx: any) => {
        const itemName = tx.items?.name || "Unknown";
        salesMap[itemName] = (salesMap[itemName] || 0) + 1;
    });

    // Превращаем в массив для графика
    const salesChartData = Object.entries(salesMap).map(([name, count]) => ({ name, count }));

    setStats(prev => ({ ...prev, sales: transactions?.length || 0, revenue: totalRevenue }));
    setTopSellingItems(salesChartData);

    // 3. ТОП ПО ПРОСМОТРАМ
    const { data: items } = await supabase
        .from('items')
        .select('name, views')
        .order('views', { ascending: false })
        .limit(5);
    
    if (items) setPopularItems(items);
    
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('items').insert([{
        name: newItem.name,
        type: newItem.type,
        price: parseFloat(newItem.price),
        rarity: newItem.rarity,
        image_url: newItem.image_url,
        description: newItem.description,
        views: 0
    }]);

    if (error) alert("Error: " + error.message);
    else {
        alert("Asset deployed!");
        setNewItem({ name: '', type: 'Art', price: '', rarity: 'Common', image_url: '', description: '' });
        fetchStats();
    }
  };

  if (loading) return <div className="min-h-screen bg-cyber-black flex items-center justify-center text-cyber-neon font-orbitron animate-pulse">VERIFYING ADMIN SIGNATURE...</div>;

  return (
    <main className="min-h-screen bg-cyber-black text-white font-rajdhani pb-20">
      <div className="fixed inset-0 bg-noise opacity-10 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-red-500/30 bg-red-900/10 backdrop-blur-md p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-orbitron text-red-500 flex items-center gap-2">
                <ShieldAlert /> ADMIN CONSOLE v2.0
            </h1>
            <Link href="/" className="text-xs uppercase tracking-widest hover:text-white text-gray-400">Exit to Market</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8 mt-8 relative z-10">
        
        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cyber-dark border border-white/10 p-6 rounded relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={64}/></div>
                <p className="text-gray-500 uppercase text-xs tracking-widest">Registered Agents</p>
                <p className="text-4xl font-orbitron text-white mt-2">{stats.users}</p>
            </div>
            <div className="bg-cyber-dark border border-white/10 p-6 rounded relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Package size={64}/></div>
                <p className="text-gray-500 uppercase text-xs tracking-widest">Total Transactions</p>
                <p className="text-4xl font-orbitron text-cyber-neon mt-2">{stats.sales}</p>
            </div>
            <div className="bg-cyber-dark border border-white/10 p-6 rounded relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={64}/></div>
                <p className="text-gray-500 uppercase text-xs tracking-widest">Total Revenue</p>
                <p className="text-4xl font-orbitron text-cyber-pink mt-2">{stats.revenue.toFixed(2)}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ADD ITEM FORM */}
            <div className="lg:col-span-1 bg-cyber-dark/50 border border-white/10 p-6 rounded h-fit">
                <h2 className="font-orbitron text-xl mb-6 flex items-center gap-2 text-cyber-neon">
                    <Plus size={20}/> DEPLOY ASSET
                </h2>
                <form onSubmit={handleAddItem} className="space-y-4">
                    <input required placeholder="Asset Name" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyber-neon outline-none" 
                        value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    
                    <select className="w-full bg-black/50 border border-white/20 p-3 text-white outline-none"
                        value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                        <option value="Art">Art</option>
                        <option value="Weapon Skin">Weapon Skin</option>
                        <option value="Access">Access</option>
                        <option value="Hardware">Hardware</option>
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" step="0.01" placeholder="Price" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyber-neon outline-none" 
                            value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                        <select className="w-full bg-black/50 border border-white/20 p-3 text-white outline-none"
                            value={newItem.rarity} onChange={e => setNewItem({...newItem, rarity: e.target.value})}>
                            <option value="Common">Common</option>
                            <option value="Rare">Rare</option>
                            <option value="Legendary">Legendary</option>
                        </select>
                    </div>

                    <input required placeholder="Image URL" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyber-neon outline-none" 
                        value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url: e.target.value})} />
                    
                    <textarea required placeholder="Description (Why buy?)" rows={3} className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyber-neon outline-none" 
                        value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />

                    <button type="submit" className="w-full bg-white text-black font-bold font-orbitron py-3 hover:bg-cyber-neon transition-colors">
                        PUBLISH
                    </button>
                </form>
            </div>

            {/* CHARTS SECTION */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* График просмотров */}
                <div className="bg-cyber-dark/50 border border-white/10 p-6 rounded">
                    <h2 className="font-orbitron text-lg mb-4 flex items-center gap-2 text-cyber-pink">
                        <TrendingUp size={18}/> MOST VIEWED ASSETS
                    </h2>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularItems}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#050507', borderColor: '#333' }} itemStyle={{ color: '#bc13fe' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                                <Bar dataKey="views" fill="#bc13fe" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* График продаж (НОВОЕ!) */}
                <div className="bg-cyber-dark/50 border border-white/10 p-6 rounded">
                    <h2 className="font-orbitron text-lg mb-4 flex items-center gap-2 text-green-400">
                        <DollarSign size={18}/> BEST SELLERS (UNITS SOLD)
                    </h2>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topSellingItems}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#050507', borderColor: '#333' }} itemStyle={{ color: '#4ade80' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                                <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>

        {/* USER CONTROL DATABASE (НОВОЕ!) */}
        <div className="bg-cyber-dark/50 border border-white/10 rounded overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="font-orbitron text-xl flex items-center gap-2 text-white">
                    <Users size={20}/> USER DATABASE
                </h2>
                <div className="text-xs text-gray-500 font-mono">ENCRYPTED // ADMIN EYES ONLY</div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/10">
                            <th className="p-4">Codename</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-right">Balance</th>
                            <th className="p-4 text-right">Registered</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {usersList.map((user) => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-neon to-cyber-pink flex items-center justify-center text-black font-bold text-xs">
                                        {user.username?.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="text-white">{user.username || "Unknown"}</span>
                                </td>
                                <td className="p-4">
                                    {user.is_admin ? (
                                        <span className="bg-red-500/20 text-red-500 border border-red-500/50 px-2 py-1 text-[10px] rounded uppercase font-bold">Admin</span>
                                    ) : (
                                        <span className="bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/30 px-2 py-1 text-[10px] rounded uppercase">User</span>
                                    )}
                                </td>
                                <td className="p-4 text-right text-white">
                                    {user.credits.toFixed(2)} CR
                                </td>
                                <td className="p-4 text-right text-gray-500 text-xs">
                                    ID: {user.id.substring(0, 8)}...
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </main>
  );
}