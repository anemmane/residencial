import React from "react";

export default function Dashboard({ user }) {
  return (
    <div className="p-6">
      {/* Saludo general */}
      <h1 className="text-3xl font-bold text-gray-900">
        Bienvenido, {user.nombre}
      </h1>

      {/* Si es admin */}
      {user.role === "admin" && (
        <p className="mt-4 text-lg text-gray-700">
          Este es tu panel administrativo. Usa el menú lateral para gestionar usuarios,
          pagos y configuraciones.
        </p>
      )}

      {/* Si es usuario normal */}
      {user.role !== "admin" && (
        <div className="mt-4 text-lg text-gray-700">
          <p>
            Aquí puedes ver tu información general. Para consultar tus pagos o realizar
            uno nuevo, utiliza el menú lateral en la sección <strong>Pagos</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
