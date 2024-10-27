"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function Page() {
  const [notes, setNotes] = useState<any[] | null>(null);
  const [newNote, setNewNote] = useState("");

  const [groupName, setGroupName] = useState("kelompok1");
  const [status, setStatus] = useState("pass");
  const [attempts, setAttempts] = useState("16");

  const supabase = createClient();

  //   useEffect(() => {
  //     const getData = async () => {
  //       const { data } = await supabase.from("notes").select();
  //       setNotes(data);
  //     };
  //     getData();
  //   }, []);

  const insertNote = async () => {
    // if (!newNote) return;

    const { data, error } = await supabase
      .from<User_Attempts>("user_attempts")
      .insert([
        {
          attempts: attempts,
          username: groupName,
          status: status,
        },
      ]);

    if (error) {
      console.log("Error inserting note:", error);
    }
    //else {
    //   const newData = Array.isArray(data) ? data : [data]; // Ensure data is an array
    //   setNotes((prev) => {
    //     const currentNotes = prev ?? []; // Ensure we have an array to work with
    //     return [...currentNotes, ...newData];
    //   });
    // setNewNote(""); // Clear the input field after insertion
    // }
  };

  return (
    <div>
      <h1>Notes</h1>

      {/* <input
        type="text"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a new note"
      /> */}
      <button onClick={insertNote}>Add Note</button>
    </div>
  );
}
