import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState({
    user_email: '',
    user_password: ''
  })

  const [loading, setLoading] = useState(false);

  const saveData = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const validation = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const datas = await res.json()

      if (res.ok) {
        localStorage.setItem('token', datas.token)
        navigate('/Agenda')
      } else {
        alert('Datos incorrectos')
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF0EC] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / título */}
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
              Bienvenido
            </h2>

            <p className="text-sm text-[#8B94A0] mt-1">
              Ingresa a tu agenda de trabajo
            </p>
          </div>


          {/* Correo */}
          <div className="flex flex-col gap-2 mb-4">

            <label className="text-xs font-semibold uppercase tracking-[0.4px] text-[#1E2A3A]">
              Correo
            </label>

            <input
              type="text"
              placeholder="correo@ejemplo.com"
              value={data.user_email}
              onChange={saveData}
              name="user_email"
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
          <div className="flex flex-col gap-2 mb-6">

            <label className="text-xs font-semibold uppercase tracking-[0.4px] text-[#1E2A3A]">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="••••••••"
              onChange={saveData}
              name="user_password"
              value={data.user_password}
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


          {/* Botón */}
          <button
            onClick={validation}
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
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>


          {/* Registro */}
          <div className="flex justify-center gap-1.5 mt-6 text-sm">

            <span className="text-[#8B94A0]">
              ¿No tienes cuenta?
            </span>

            <Link
              to="/Forms"
              className="
                text-[#C4453B]
                font-medium
                hover:underline
              "
            >
              Regístrate
            </Link>

          </div>

        </div>


        {/* Texto inferior */}
        <p className="text-center text-xs text-[#B5BAAF] mt-5">
          Agenda de trabajo
        </p>

      </div>

    </div>
  )
}

export default Login