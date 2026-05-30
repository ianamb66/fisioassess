export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">Política de Privacidad</h1>
      <p className="text-gray-600 mt-3">
        Esta es una plantilla. Antes de usar FisioAssess con datos reales de pacientes, define y publica una política de
        privacidad adecuada a tu país/estado, al tipo de datos recolectados y al proveedor de almacenamiento.
      </p>
      <ul className="list-disc pl-6 mt-4 text-gray-700 space-y-2">
        <li>Qué datos se recolectan (pacientes, evaluaciones, notas).</li>
        <li>Dónde se almacenan (por ejemplo Supabase) y por cuánto tiempo.</li>
        <li>Cómo se protegen (acceso por cuenta, controles de permisos).</li>
        <li>Cómo solicitar exportación/eliminación.</li>
      </ul>
    </main>
  );
}
