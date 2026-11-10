"use client";

import { useEffect, useState } from "react";
import {
  getProfiles,
  getCurrentProfile,
  setCurrentProfile,
  addProfile,
} from "@/lib/store";

export default function ProfileSwitcher() {
  const [profiles, setProfiles] = useState<string[]>(["Default"]);
  const [current, setCurrent] = useState("Default");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setProfiles(getProfiles());
    setCurrent(getCurrentProfile());
  }, []);

  function select(name: string) {
    setCurrentProfile(name);
    setCurrent(name);
  }

  function add() {
    const name = newName.trim();
    if (!name) return;
    addProfile(name);
    setProfiles(getProfiles());
    setCurrent(name);
    setAdding(false);
    setNewName("");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500">Profile</span>
      {adding ? (
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
            if (e.key === "Escape") setAdding(false);
          }}
          placeholder="Name"
          autoFocus
          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
        />
      ) : (
        <select
          value={current}
          onChange={(e) => select(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
        >
          {profiles.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
      {adding ? (
        <button
          onClick={add}
          className="rounded-md bg-slate-900 px-2 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Save
        </button>
      ) : (
        <button
          onClick={() => setAdding(true)}
          title="Add a profile"
          className="rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          +
        </button>
      )}
    </div>
  );
}
