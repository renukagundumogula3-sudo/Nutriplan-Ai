import { useContext, useState } from "react";
import { NutriContext } from "../context/NutriContext";

export default function ChatBox() {
  const { chat, setChat } = useContext(NutriContext);
  const [msg, setMsg] = useState("");

  const send = () => {
    setChat([...chat, { user: msg }]);
    setMsg("");
  };

  return (
    <div className="border p-4 mt-4">
      <div className="h-32 overflow-y-auto">
        {chat.map((c, i) => (
          <p key={i} className="text-sm">👤 {c.user}</p>
        ))}
      </div>

      <input
        className="border p-2 w-full mt-2"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Ask nutrition question..."
      />
      <button onClick={send} className="bg-blue-500 text-white p-2 mt-2">
        Send
      </button>
    </div>
  );
}
