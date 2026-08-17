import React, { useState, useMemo, useEffect } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Clock,
  StickyNote,
  CalendarDays,
} from "lucide-react";

const API_URL = "http://localhost:3000";

const CATEGORY = {
  meeting: { label: "Reunión", color: "#3E7C74" },
  task: { label: "Tarea", color: "#C68A2E" },
  personal: { label: "Personal", color: "#7B5AA6" },
};

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toKey(date) {
  return date.toISOString().slice(0, 10);
}
function isSameDay(a, b) {
  return toKey(a) === toKey(b);
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

const todayDate = new Date();

export default function WorkAgenda() {
  const [weekStart, setWeekStart] = useState(startOfWeek(todayDate));
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const [modalDay, setModalDay] = useState(null);
  const [form, setForm] = useState({ title: "", time: "09:00", category: "meeting", note: "" });

  // Carga inicial: trae SOLO lo que pertenece al usuario logueado (según el token)
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resEventos, resNotas] = await Promise.all([
          fetch(`${API_URL}/eventos`, { headers: authHeaders() }),
          fetch(`${API_URL}/notas`, { headers: authHeaders() }),
        ]);

        if (resEventos.ok) {
          const data = await resEventos.json();
          setEvents(data.map((e) => ({
            id: e.id,
            day: e.dia.slice(0, 10),
            time: e.hora.slice(0, 5),
            title: e.titulo,
            category: e.categoria,
            note: e.nota || "",
          })));
        }

        if (resNotas.ok) {
          const data = await resNotas.json();
          setNotes(data.map((n) => ({ id: n.id, text: n.texto, color: n.color })));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const weekLabel = () => {
    const end = addDays(weekStart, 6);
    const sameMonth = weekStart.getMonth() === end.getMonth();
    const startStr = `${weekStart.getDate()} ${sameMonth ? "" : MONTH_NAMES[weekStart.getMonth()].slice(0, 3)}`;
    const endStr = `${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)}`;
    return `${startStr} — ${endStr}, ${end.getFullYear()}`;
  };

  function openModal(day) {
    setForm({ title: "", time: "09:00", category: "meeting", note: "" });
    setModalDay(day);
  }

  async function saveEvent() {
    if (!form.title.trim()) return;
    try {
      const res = await fetch(`${API_URL}/eventos`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          titulo: form.title.trim(),
          dia: toKey(modalDay),
          hora: form.time,
          categoria: form.category,
          nota: form.note.trim(),
        }),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setEvents((prev) => [
          ...prev,
          {
            id: nuevo.id,
            day: nuevo.dia.slice(0, 10),
            time: nuevo.hora.slice(0, 5),
            title: nuevo.titulo,
            category: nuevo.categoria,
            note: nuevo.nota || "",
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
    setModalDay(null);
  }

  async function deleteEvent(id) {
    try {
      const res = await fetch(`${API_URL}/eventos/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function addNote() {
    if (!noteDraft.trim()) return;
    const palette = ["#F4EFE3", "#E9F1EF", "#F1E9F4", "#F4E9E9"];
    const color = palette[notes.length % palette.length];
    try {
      const res = await fetch(`${API_URL}/notas`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ texto: noteDraft.trim(), color }),
      });
      if (res.ok) {
        const nueva = await res.json();
        setNotes((prev) => [{ id: nueva.id, text: nueva.texto, color: nueva.color }, ...prev]);
      }
    } catch (error) {
      console.error(error);
    }
    setNoteDraft("");
  }

  async function deleteNote(id) {
    try {
      const res = await fetch(`${API_URL}/notas/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#8B94A0" }}>
        Cargando tu agenda…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#EEF0EC", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .agenda-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .agenda-scroll::-webkit-scrollbar-thumb { background: #C9CCC3; border-radius: 4px; }
        .day-col { background-image: repeating-linear-gradient(to bottom, transparent, transparent 27px, #DDE0D8 28px); }
        .ev-card { transition: transform .12s ease, box-shadow .12s ease; }
        .ev-card:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(30,42,58,0.08); }
        .icon-btn { transition: background .15s ease; }
        .icon-btn:hover { background: rgba(30,42,58,0.06); }
      `}</style>

      <div className="flex flex-col lg:flex-row" style={{ maxWidth: 1180, margin: "0 auto", minHeight: "100vh" }}>
        <aside className="lg:w-72 shrink-0 p-6 flex flex-col gap-8" style={{ borderRight: "1px solid #DDE0D8" }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#1E2A3A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={18} color="#EEF0EC" />
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 600, color: "#1E2A3A" }}>
              Agenda
            </span>
          </div>

          <MiniMonth weekStart={weekStart} onPickWeek={(d) => setWeekStart(startOfWeek(d))} />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2" style={{ color: "#1E2A3A" }}>
              <StickyNote size={15} />
              <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Notas
              </span>
            </div>

            <div className="flex gap-1.5">
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Escribe una nota…"
                style={{ flex: 1, fontSize: 13, padding: "7px 10px", borderRadius: 7, border: "1px solid #D7D9D2", background: "#fff", outline: "none" }}
              />
              <button onClick={addNote} className="icon-btn" style={{ borderRadius: 7, border: "1px solid #D7D9D2", padding: "0 9px", background: "#fff" }}>
                <Plus size={15} color="#1E2A3A" />
              </button>
            </div>

            <div className="flex flex-col gap-2 agenda-scroll" style={{ maxHeight: 260, overflowY: "auto" }}>
              {notes.length === 0 && (
                <p style={{ fontSize: 12.5, color: "#8B94A0" }}>Sin notas todavía.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} style={{ background: n.color, borderRadius: 8, padding: "9px 10px", fontSize: 13, color: "#1E2A3A", position: "relative", lineHeight: 1.4 }}>
                  <span style={{ paddingRight: 18 }}>{n.text}</span>
                  <button onClick={() => deleteNote(n.id)} className="icon-btn" style={{ position: "absolute", top: 6, right: 6, borderRadius: 5, padding: 3 }}>
                    <X size={12} color="#6B7280" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 flex flex-col gap-5 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: "#1E2A3A" }}>
                Semana del {weekLabel()}
              </h1>
              <p style={{ fontSize: 12.5, color: "#8B94A0", marginTop: 2 }}>
                {events.filter((e) => weekDays.some((d) => toKey(d) === e.day)).length} eventos esta semana
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="icon-btn" style={{ padding: 7, borderRadius: 7, border: "1px solid #D7D9D2", background: "#fff" }}>
                <ChevronLeft size={16} color="#1E2A3A" />
              </button>
              <button onClick={() => setWeekStart(startOfWeek(todayDate))} className="icon-btn" style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #D7D9D2", background: "#fff", fontSize: 12.5, fontWeight: 500, color: "#1E2A3A" }}>
                Hoy
              </button>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="icon-btn" style={{ padding: 7, borderRadius: 7, border: "1px solid #D7D9D2", background: "#fff" }}>
                <ChevronRight size={16} color="#1E2A3A" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, todayDate);
              const dayEvents = events
                .filter((e) => e.day === toKey(day))
                .sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div key={i} className="day-col" style={{ borderRadius: 10, background: "#fff", border: isToday ? "1.5px solid #C4453B" : "1px solid #DDE0D8", display: "flex", flexDirection: "column", minHeight: 220, position: "relative", overflow: "hidden" }}>
                  {isToday && (
                    <div style={{ position: "absolute", top: 0, right: 10, background: "#C4453B", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: "0 0 6px 6px", letterSpacing: 0.3 }}>
                      HOY
                    </div>
                  )}
                  <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #EAEBE5" }}>
                    <div style={{ fontSize: 11, color: "#8B94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.4 }}>
                      {DAY_NAMES[day.getDay()]}
                    </div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: isToday ? "#C4453B" : "#1E2A3A" }}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 agenda-scroll" style={{ padding: 8, flex: 1, overflowY: "auto" }}>
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="ev-card" style={{ background: "#F9F9F6", borderLeft: `3px solid ${CATEGORY[ev.category].color}`, borderRadius: 6, padding: "6px 8px", position: "relative" }}>
                        <div className="flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#8B94A0" }}>
                          <Clock size={10} /> {ev.time}
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#1E2A3A", marginTop: 1, paddingRight: 14 }}>
                          {ev.title}
                        </div>
                        {ev.note && (
                          <div style={{ fontSize: 11, color: "#8B94A0", marginTop: 2 }}>{ev.note}</div>
                        )}
                        <button onClick={() => deleteEvent(ev.id)} className="icon-btn" style={{ position: "absolute", top: 5, right: 4, borderRadius: 4, padding: 2 }}>
                          <Trash2 size={11} color="#8B94A0" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => openModal(day)} className="icon-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11.5, color: "#8B94A0", padding: "7px 0", borderTop: "1px solid #EAEBE5" }}>
                    <Plus size={12} /> Añadir
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: 11.5, color: "#8B94A0" }}>
            {Object.entries(CATEGORY).map(([key, c]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: 3, background: c.color, display: "inline-block" }} />
                {c.label}
              </div>
            ))}
          </div>
        </main>
      </div>

      {modalDay && (
        <div onClick={() => setModalDay(null)} style={{ position: "fixed", inset: 0, background: "rgba(30,42,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, padding: 22, width: 340, boxShadow: "0 20px 40px rgba(30,42,58,0.2)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "#1E2A3A" }}>
                Nuevo evento · {DAY_NAMES[modalDay.getDay()]} {modalDay.getDate()}
              </h3>
              <button onClick={() => setModalDay(null)} className="icon-btn" style={{ borderRadius: 6, padding: 4 }}>
                <X size={16} color="#8B94A0" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input autoFocus placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ fontSize: 13.5, padding: "9px 11px", borderRadius: 7, border: "1px solid #D7D9D2", outline: "none" }} />
              <div className="flex gap-2">
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={{ flex: 1, fontSize: 13.5, padding: "9px 11px", borderRadius: 7, border: "1px solid #D7D9D2", outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ flex: 1, fontSize: 13.5, padding: "9px 11px", borderRadius: 7, border: "1px solid #D7D9D2", outline: "none", background: "#fff" }}>
                  {Object.entries(CATEGORY).map(([key, c]) => (
                    <option key={key} value={key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <textarea placeholder="Nota (opcional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} style={{ fontSize: 13, padding: "9px 11px", borderRadius: 7, border: "1px solid #D7D9D2", outline: "none", resize: "none", fontFamily: "inherit" }} />
              <button onClick={saveEvent} style={{ background: "#1E2A3A", color: "#fff", fontSize: 13.5, fontWeight: 500, padding: "10px 0", borderRadius: 8, marginTop: 4 }}>
                Guardar evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniMonth({ weekStart, onPickWeek }) {
  const ref = new Date(weekStart);
  const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1E2A3A", marginBottom: 8 }}>
        {MONTH_NAMES[ref.getMonth()]} {ref.getFullYear()}
      </div>
      <div className="grid grid-cols-7 gap-y-1" style={{ fontSize: 10.5 }}>
        {DAY_NAMES.map((d, i) => (
          <div key={i} style={{ textAlign: "center", color: "#B5BAAF", fontWeight: 500 }}>{d[0]}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const cellDate = new Date(ref.getFullYear(), ref.getMonth(), d);
          const isToday = isSameDay(cellDate, todayDate);
          const inSelectedWeek = cellDate >= weekStart && cellDate < addDays(weekStart, 7);
          return (
            <button key={i} onClick={() => onPickWeek(cellDate)} style={{ width: 22, height: 22, borderRadius: 6, fontSize: 10.5, margin: "1px auto", color: isToday ? "#fff" : "#1E2A3A", background: isToday ? "#C4453B" : inSelectedWeek ? "#E3E6DE" : "transparent", fontWeight: isToday ? 600 : 400 }}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}