import React from 'react';
import { useParams } from 'react-router-dom';

function RepositoryDetail() {
    const { id } = useParams();

    return (
        <div>
            <h2>仓库详情</h2>
            <p>仓库 ID: {id}</p>
        </div>
    );
}

export default RepositoryDetail; 