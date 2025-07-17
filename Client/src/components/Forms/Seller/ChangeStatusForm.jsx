import CustomForm from "../CustomForm";
import useAuthStore from "@/store/useAuthStore";

export default function ChangeStatusForm({
  onConfirm,
  onCancel,
  isDarkMode,
  selectedBus,
}) {
  const usuario = useAuthStore((state) => state.user);

  const fields = [
    {
      name: "fecha_inicio",
      label: "Fecha y hora de inicio",
      type: "datetime-local",
    },
    {
      name: "fecha_fin",
      label: "Fecha y hora de fin",
      type: "datetime-local",
    },
  ];

  const initialValues = {
    fecha_inicio: "",
    fecha_fin: "",
  };

  const validate = (values) => {
    const errors = {};
    const now = new Date();

    if (!values.fecha_inicio) {
      errors.fecha_inicio = "Debe ingresar la fecha de inicio.";
    } else if (new Date(values.fecha_inicio) <= now) {
      errors.fecha_inicio = "La fecha de inicio debe ser posterior al momento actual.";
    }

    if (!values.fecha_fin) {
      errors.fecha_fin = "Debe ingresar la fecha de fin.";
    } else if (new Date(values.fecha_fin) <= now) {
      errors.fecha_fin = "La fecha de fin debe ser posterior al momento actual.";
    }

    if (
      values.fecha_inicio &&
      values.fecha_fin &&
      new Date(values.fecha_fin) <= new Date(values.fecha_inicio)
    ) {
      errors.fecha_fin = "La fecha de fin debe ser posterior a la de inicio.";
    }

    return errors;
  };


  const handleSubmit = (values) => {
    const formatted = {
      id_omnibus: selectedBus?.id_omnibus,
      vendedor: usuario.uuidAuth,
      activo: false,
      ...values,
    };

    onConfirm?.(formatted);
  };

  return (
    <CustomForm
      title={`Programar inactivación`}
      fields={fields}
      submitText="Confirmar"
      cancelText="Cancelar"
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
      onClose={onCancel}
      isDarkMode={isDarkMode}
      withModal={true}
    />
  );
}
