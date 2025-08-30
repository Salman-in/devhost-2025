interface Props {
  params: { id: string };
  searchParams: { paymentId?: string; email?: string };
}

export default async function SuccessPage({ params, searchParams }: Props) {
  const eventId = parseInt(params.id, 10);
  const { paymentId, email } = await searchParams;

  if (!paymentId || !email) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-xl text-red-600">Missing payment details.</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
      <p className="mt-4">
        🎉 You have successfully registered for Event ID: {eventId}
      </p>
      <p className="mt-2">
        Payment ID: <strong>{paymentId}</strong>
      </p>
      <p className="mt-2 text-gray-500">Email: {email}</p>
    </div>
  );
}
