import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Forms = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    user_name: '',
    user_password: '',
    user_email: '',
    rol: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const saveData = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const sendData = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/Forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const information = await res.json();

      if (res.ok) {
        alert('Registro Exitoso');
        navigate('/');
      } else {
        setError(information.mensaje || 'Error al registrar');
      }
    } catch (error) {
      console.error(error);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF0EC] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">

          <div className="w-11 h-11 rounded-xl bg-[#1E2A3A] flex items-center justify-center">
            <span className="text-[#EEF0EC] text-lg">✓</span>
          </div>

          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[#1E2A3A]">
            Agenda
          </h1>

        </div>


        {/* Tarjeta */}
        <div className="bg-white border border-[#DDE0D8] rounded-xl p-8 shadow-[0_12px_30px_rgba(30,42,58,0.08)]">

          <div className="mb-7">
            <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#1E2A3A]">
              Crear cuenta
            </h2>

            <p className="text-sm text-[#8B94A0] mt-1">
              Regístrate para comenzar a utilizar tu agenda
            </p>
          </div>


          {/* Nombre */}
          <div className="flex flex-col gap-2 mb-4">

            <label className="text-xs font-semibold uppercase tracking-[0.4px] text-[#1E2A3A]">
              Nombre
            </label>

            <input
              type="text"
              id="nombre"
              value={data.user_name}
              name="user_name"
              placeholder="Nombre"
              onChange={saveData}
              required
              className="
                w-full
                px-3
                py-2.5
                rounded-lg
                border
                border-[#D7D9D2]
                bg-white
                text-sm
                text-[#1E2A3A]
                outline-none
                transition
                focus:border-[#1E2A3A]
                focus:ring-2
                focus:ring-[#1E2A3A]/10
                placeholder:text-[#B5BAAF]
              "
            />

          </div>


          {/* Email */}
          <div className="flex flex-col gap-2 mb-4">

            <label className="text-xs font-semibold uppercase tracking-[0.4px] text-[#1E2A3A]">
              Email
            </label>

            <input
              type="email"
              id="email"
              name="user_email"
              value={data.user_email}
              onChange={saveData}
              placeholder="correo@ejemplo.com"
              required
              className="
                w-full
                px-3
                py-2.5
                rounded-lg
                border
                border-[#D7D9D2]
                bg-white
                text-sm
                text-[#1E2A3A]
                outline-none
                transition
                focus:border-[#1E2A3A]
                focus:ring-2
                focus:ring-[#1E2A3A]/10
                placeholder:text-[#B5BAAF]
              "
            />

          </div>


          {/* Contraseña */}
          <div className="flex flex-col gap-2 mb-4">

            <label className="text-xs font-semibold uppercase tracking-[0.4px] text-[#1E2A3A]">
              Contraseña
            </label>

            <input
              type="password"
              id="password"
              value={data.user_password}
              onChange={saveData}
              name="user_password"
              placeholder="••••••••"
              required
              className="
                w-full
                px-3
                py-2.5
                rounded-lg
                border
                border-[#D7D9D2]
                bg-white
                text-sm
                text-[#1E2A3A]
                outline-none
                transition
                focus:border-[#1E2A3A]
                focus:ring-2
                focus:ring-[#1E2A3A]/10
                placeholder:text-[#B5BAAF]
              "
            />

          </div>


          {/* Cargo */}
          <div className="flex flex-col gap-2 mb-6">

            <label className="text-xs font-semibold uppercase tracking-[0.4px] text-[#1E2A3A]">
              Cargo
            </label>

            <input
              type="text"
              id="rol"
              value={data.rol}
              onChange={saveData}
              name="rol"
              placeholder="Cargo"
              required
              className="
                w-full
                px-3
                py-2.5
                rounded-lg
                border
                border-[#D7D9D2]
                bg-white
                text-sm
                text-[#1E2A3A]
                outline-none
                transition
                focus:border-[#1E2A3A]
                focus:ring-2
                focus:ring-[#1E2A3A]/10
                placeholder:text-[#B5BAAF]
              "
            />

          </div>


          {/* Error */}
          {error && (
            <p className="text-sm text-[#C4453B] bg-[#F4E9E9] border border-[#E8CACA] rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}


          {/* Botón */}
          <button
            onClick={sendData}
            disabled={loading}
            className="
              w-full
              bg-[#1E2A3A]
              hover:bg-[#28384D]
              disabled:opacity-60
              disabled:cursor-not-allowed
              text-white
              text-sm
              font-medium
              py-2.5
              rounded-lg
              transition
              duration-150
            "
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>


          {/* Login */}
          <div className="flex justify-center gap-1.5 mt-6 text-sm">

            <span className="text-[#8B94A0]">
              ¿Ya tienes una cuenta?
            </span>

            <Link
              to="/"
              className="text-[#C4453B] font-medium hover:underline"
            >
              Inicia sesión
            </Link>

          </div>

        </div>


        <p className="text-center text-xs text-[#B5BAAF] mt-5">
          Agenda de trabajo
        </p>

      </div>

    </div>
  )
}

export default Forms