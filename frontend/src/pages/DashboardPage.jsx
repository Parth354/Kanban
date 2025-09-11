// File: src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import services and components
import useAuthStore from '../store/authStore';
import { getBoards, createBoard } from '../api/boardService'; // Import createBoard
import ProjectCard from '../components/ui/ProjectCard';
import ProjectModal from '../components/ui/ProjectModal'; // Import the new modal

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // State for the dashboard data
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch boards when the component mounts
  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const userBoards = await getBoards();
      setBoards(userBoards);
    } catch (err) {
      setError('Could not fetch your projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);
  
  // --- Modal Handler Functions ---

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateProject = async (projectData) => {
    setIsCreating(true);
    try {
      const newBoard = await createBoard(projectData);
      // Add the new board to the list for an instant UI update
      setBoards(prevBoards => [...prevBoards, newBoard]);
      handleCloseModal();
      // Optional: Navigate to the new board immediately
      navigate(`/boards/${newBoard.id}`);
    } catch (err) {
      // You could display this error in the modal
      alert('Failed to create project. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // --- Render Logic ---

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-500">Loading your projects...</p>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    if (boards.length === 0) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">You don't have any projects yet.</p>
          <button
            onClick={handleOpenModal} // Wire up the button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Your First Project
          </button>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map(board => (
          <ProjectCard key={board.id} board={board} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Your Projects</h2>
          <button
            onClick={handleOpenModal} // Wire up the main "New Project" button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>
        
        {renderContent()}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateProject}
        isLoading={isCreating}
      />
    </>
  );
};

export default DashboardPage;