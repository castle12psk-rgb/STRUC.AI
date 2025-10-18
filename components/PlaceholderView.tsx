import React from 'react';

interface PlaceholderViewProps {
    title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <p className="text-gray-500">이 페이지는 현재 개발 중입니다.</p>
            </div>
        </div>
    );
};

export default PlaceholderView;