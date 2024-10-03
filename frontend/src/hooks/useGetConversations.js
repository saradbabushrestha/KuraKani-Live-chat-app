import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!data || data.error) {
          throw new Error(data?.error || "Unexpected response from the server");
        }

        setConversations(data); // Assuming `data` is an array of conversations
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error(`Failed to load conversations: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return { loading, conversations };
};

export default useGetConversations;
