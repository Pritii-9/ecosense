export const FieldError = ({ message }: { message: string }) => {
  if (!message) {
    return null
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>
}
