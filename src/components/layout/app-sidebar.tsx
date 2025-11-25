// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Upload,
//   BookOpen,
//   List,
//   Sparkles,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarHeader,
//   SidebarFooter,
// } from "@/components/ui/sidebar";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const items = [
//   {
//     title: "主页",
//     url: "/home",
//     icon: Home,
//   },
//   {
//     title: "AI 答疑助手",
//     url: "/ai-explain",
//     icon: Sparkles,
//   },
//   {
//     title: "上传错题",
//     url: "/upload-question",
//     icon: Upload,
//   },
//   {
//     title: "我的错题",
//     url: "/my-question",
//     icon: BookOpen,
//   },
//   {
//     title: "知识点库",
//     url: "/knowledge-base",
//     icon: List,
//   },
// ];

// export function AppSidebar() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   return (
//     <Sidebar>
//       <SidebarHeader className="p-4 border-b border-slate-100">
//         <h2 className="text-xl font-bold flex items-center gap-2 px-2 text-slate-800">
//           <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm">
//             <Sparkles size={18} />
//           </div>
//           智能错题系统
//         </h2>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Platform</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item) => {
//                 const isActive = location.pathname.startsWith(item.url);

//                 return (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton
//                       asChild
//                       onClick={() => navigate(item.url)}
//                       isActive={isActive}
//                       className={cn(
//                         "cursor-pointer transition-all duration-200 font-medium h-10 my-0.5",
//                         isActive
//                           ? "bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
//                           : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
//                       )}
//                     >
//                       <div className="flex items-center gap-3 px-2">
//                         <item.icon className={cn("size-5", isActive ? "text-purple-600" : "text-slate-400")} />
//                         <span>{item.title}</span>
//                       </div>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter className="p-4 border-t border-slate-100">
//         <div className="flex items-center gap-3 px-2">
//            <Avatar className="h-8 w-8 border border-slate-200">
//               <AvatarImage src="https://github.com/shadcn.png" />
//               <AvatarFallback>CN</AvatarFallback>
//            </Avatar>
//            <div className="flex flex-col text-sm">
//              <span className="font-medium text-slate-700">Shadcn</span>
//              <span className="text-xs text-muted-foreground">User Profile</span>
//            </div>
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
