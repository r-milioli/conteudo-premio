import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface Review {
    id: number;
    comment: string;
    rating: number;
    user_name: string;
    user_email: string;
    created_at: string;
    is_approved: boolean;
    content: {
        id: number;
        title: string;
    };
}

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`/api/admin/reviews?page=${currentPage}&search=${searchTerm}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar avaliações');
                }

                const data = await response.json();
                setReviews(data.reviews);
                setTotalPages(Math.ceil(data.total / itemsPerPage));
            } catch (error) {
                console.error('Erro ao carregar avaliações:', error);
                toast({
                    title: "Erro",
                    description: "Não foi possível carregar as avaliações.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        // Debounce para a pesquisa
        const timeoutId = setTimeout(() => {
            fetchReviews();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [currentPage, searchTerm]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset para a primeira página ao pesquisar
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleApprove = async (id: number) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/reviews/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao aprovar avaliação');
            }

            setReviews(reviews.map(review =>
                review.id === id ? { ...review, is_approved: true } : review
            ));

            toast({
                title: "Sucesso",
                description: "Avaliação aprovada com sucesso!",
            });
        } catch (error) {
            console.error('Erro ao aprovar avaliação:', error);
            toast({
                title: "Erro",
                description: "Não foi possível aprovar a avaliação.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir avaliação');
            }

            setReviews(reviews.filter(review => review.id !== id));

            toast({
                title: "Sucesso",
                description: "Avaliação excluída com sucesso!",
            });
        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir a avaliação.",
                variant: "destructive"
            });
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold mb-4 sm:mb-6">Gerenciar Avaliações</h1>

            {/* Barra de pesquisa */}
            <div className="w-full sm:max-w-md mb-4 sm:mb-6">
                <Input
                    type="text"
                    placeholder="Pesquisar avaliações..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full"
                />
            </div>

            <div className="space-y-4">
                {reviews.length > 0 ? (
                    <>
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <span className="font-medium text-sm sm:text-base">{review.user_name}</span>
                                        <span className="text-xs sm:text-sm text-gray-500">({review.user_email})</span>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        {!review.is_approved && (
                                            <Button
                                                onClick={() => handleApprove(review.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                                            >
                                                Aprovar
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleDelete(review.id)}
                                            variant="destructive"
                                            size="sm"
                                            className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <div className="flex">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-gray-600 mb-2">{review.comment}</p>

                                <div className="text-xs sm:text-sm text-gray-500">
                                    Conteúdo: {review.content.title}
                                </div>

                                {!review.is_approved && (
                                    <div className="mt-2 text-xs sm:text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                        Aguardando aprovação
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-2 mt-6 sm:mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                                >
                                    Anterior
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        onClick={() => handlePageChange(page)}
                                        className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                                >
                                    Próxima
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm sm:text-base text-gray-500 text-center">Nenhuma avaliação encontrada.</p>
                )}
            </div>
        </div>
    );
} 