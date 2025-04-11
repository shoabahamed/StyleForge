import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Trash2, Send, Search } from "lucide-react";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UserInfo {
  user_id: string;
  username: string;
  email: string;
  image_url: string;
}

const UsersSection = () => {
  const { user: adminUser } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);

  const projectPerPage = 6;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);

  const calculatePages = (totalProjects: number) => {
    const totalPages = Math.ceil(totalProjects / projectPerPage);
    // console.log(totalProjects);
    const temp: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      temp.push(i);
    }

    return temp;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get("/all_users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminUser?.token}`,
            Role: adminUser?.role,
          },
        });
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
        setPages(calculatePages(response.data.data.length));
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const eIndex = Math.max(currentPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, users.length);

    setStartIndex(sIndex);
    setEndIndex(eIndex);
  }, [currentPageNo]);

  useEffect(() => {
    const tempProjects = users.filter(
      (user) =>
        user.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(tempProjects);
    setPages(calculatePages(tempProjects.length));
    setCurrentPageNo(1);
  }, [searchQuery]);

  const deleteUser = async (user_id: string) => {
    try {
      const response = await apiClient.delete(`/delete_user/${user_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
          Role: adminUser?.role,
        },
      });
      setUsers(users.filter((user) => user.user_id !== user_id));
      setFilteredUsers(
        filteredUsers.filter((user) => user.user_id !== user_id)
      );

      toast({
        description: "User deleted successfully!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    } catch (error) {
      toast({
        description: "Failed to delete.",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (messageContent.trim() && currentUser) {
      // Make the API call to submit the report
      try {
        const response = await apiClient.post(
          "/send_notice",
          {
            adminId: adminUser?.userId,
            userId: currentUser.user_id,
            title: messageTitle,
            message: messageContent.trim(),
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminUser?.token}`,
              Role: adminUser?.role,
            },
          }
        );
        toast({
          description: "Message sent successfully!",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        setMessageContent("");
        setMessageTitle("");
      } catch (error) {
        toast({
          description: "Failed to send message.",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        console.error(error);
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search users by name, email or ID..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.slice(startIndex, endIndex).map((user) => (
            <Card
              key={user.user_id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image_url} />
                      <AvatarFallback className="bg-blue-200 text-blue-700">
                        {user.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-[10px] lg-text-[14px]"
                  >
                    ID: {user.user_id}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="pt-2 flex justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => setCurrentUser(user)}
                    >
                      <MessageSquare size={16} className="mr-1" /> Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Send Message to {currentUser?.username}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="pt-2 pb-0">
                      <Input
                        placeholder="Type your title ..."
                        className=""
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                      />
                    </div>

                    <div className="pb-4 pt-2">
                      <Textarea
                        placeholder="Type your message here..."
                        className="min-h-32"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={sendMessage}
                      >
                        <Send size={16} className="mr-2" /> Send Message
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => navigate(`/profile/${user.user_id}`)}
                >
                  <Eye size={16} className="mr-1" /> Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => deleteUser(user.user_id)}
                >
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Pagination className="flex justify-end p-7">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPageNo(Math.max(currentPageNo - 1, 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {pages
              .slice(
                Math.max(currentPageNo - 2, 0),
                Math.min(currentPageNo + 1, pages.length)
              )
              .map((pageNo) => (
                <PaginationItem key={pageNo}>
                  <PaginationLink
                    onClick={() => setCurrentPageNo(pageNo)}
                    isActive={pageNo === currentPageNo}
                    className="cursor-pointer"
                  >
                    {pageNo}
                  </PaginationLink>
                </PaginationItem>
              ))}

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPageNo(Math.min(currentPageNo + 1, pages.length));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UsersSection;
