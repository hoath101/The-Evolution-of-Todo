import React, { ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  title,
  subtitle,
  children
}) => {
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>}
      </div>

      <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;