"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  addDoc,
  query,
  orderBy,
  limit,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface RoomParticipant {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  isActive: boolean;
}

export interface RoomMessage {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  message: string;
  timestamp: unknown;
  type: "text" | "reaction";
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useWatchRoom(roomId: string | null) {
  const [room, setRoom] = useState<{
    id: string;
    roomCode?: string;
    hostId?: string;
    movieId?: number;
    movieTitle?: string;
    moviePoster?: string | null;
    currentParticipants?: number;
    maxParticipants?: number;
    playbackState?: { isPlaying: boolean; currentTime: number };
    settings?: { allowChat: boolean; allowReactions: boolean };
  } | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);

  const createRoom = useCallback(
    async (
      userId: string,
      displayName: string,
      movieId: number,
      movieTitle: string,
      moviePoster: string | null
    ) => {
      const roomCode = generateRoomCode();
      const roomRef = doc(collection(db, "watchRooms"));
      await setDoc(roomRef, {
        roomCode,
        hostId: userId,
        movieId,
        movieTitle,
        moviePoster,
        createdAt: serverTimestamp(),
        isActive: true,
        maxParticipants: 8,
        currentParticipants: 1,
        playbackState: {
          isPlaying: false,
          currentTime: 0,
          lastUpdated: serverTimestamp(),
        },
        settings: { allowChat: true, allowReactions: true, isPublic: false },
      });
      const participantRef = doc(db, "watchRooms", roomRef.id, "participants", userId);
      await setDoc(participantRef, {
        userId,
        displayName,
        photoURL: "",
        joinedAt: serverTimestamp(),
        isActive: true,
        lastSeen: serverTimestamp(),
      });
      return { roomId: roomRef.id, roomCode };
    },
    []
  );

  const joinRoom = useCallback(
    async (
      rid: string,
      userId: string,
      displayName: string,
      photoURL: string
    ) => {
      const participantRef = doc(db, "watchRooms", rid, "participants", userId);
      await setDoc(participantRef, {
        userId,
        displayName,
        photoURL: photoURL || "",
        joinedAt: serverTimestamp(),
        isActive: true,
        lastSeen: serverTimestamp(),
      });
      const roomRef = doc(db, "watchRooms", rid);
      await updateDoc(roomRef, { currentParticipants: increment(1) });
    },
    []
  );

  const sendMessage = useCallback(
    async (
      rid: string,
      userId: string,
      displayName: string,
      photoURL: string,
      message: string
    ) => {
      const messagesRef = collection(db, "watchRooms", rid, "messages");
      await addDoc(messagesRef, {
        userId,
        displayName,
        photoURL: photoURL || "",
        message,
        timestamp: serverTimestamp(),
        type: "text",
      });
    },
    []
  );

  const sendReaction = useCallback(
    async (rid: string, userId: string, displayName: string, emoji: string) => {
      const messagesRef = collection(db, "watchRooms", rid, "messages");
      await addDoc(messagesRef, {
        userId,
        displayName,
        message: emoji,
        timestamp: serverTimestamp(),
        type: "reaction",
      });
    },
    []
  );

  const updatePlayback = useCallback(
    async (rid: string, isPlaying: boolean, currentTime: number) => {
      const roomRef = doc(db, "watchRooms", rid);
      await updateDoc(roomRef, {
        "playbackState.isPlaying": isPlaying,
        "playbackState.currentTime": currentTime,
        "playbackState.lastUpdated": serverTimestamp(),
      });
    },
    []
  );

  const leaveRoom = useCallback(async (rid: string, userId: string) => {
    const participantRef = doc(db, "watchRooms", rid, "participants", userId);
    await updateDoc(participantRef, {
      isActive: false,
      lastSeen: serverTimestamp(),
    });
    const roomRef = doc(db, "watchRooms", rid);
    await updateDoc(roomRef, { currentParticipants: increment(-1) });
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setParticipants([]);
      setMessages([]);
      return;
    }
    const roomRef = doc(db, "watchRooms", roomId);
    const unsubRoom = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) setRoom({ id: snap.id, ...snap.data() } as typeof room);
    });
    const participantsRef = collection(db, "watchRooms", roomId, "participants");
    const unsubParts = onSnapshot(participantsRef, (snap) => {
      const parts = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as RoomParticipant))
        .filter((p) => p.isActive);
      setParticipants(parts);
    });
    const messagesRef = collection(db, "watchRooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));
    const unsubMsgs = onSnapshot(q, (snap) => {
      const msgs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as RoomMessage))
        .reverse();
      setMessages(msgs);
    });
    return () => {
      unsubRoom();
      unsubParts();
      unsubMsgs();
    };
  }, [roomId]);

  return {
    room,
    participants,
    messages,
    createRoom,
    joinRoom,
    sendMessage,
    sendReaction,
    updatePlayback,
    leaveRoom,
  };
}
