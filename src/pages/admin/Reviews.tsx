import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

interface Review {
    id: number;
    comment: string;
    rating: number;
    user_name: string;
    user_email: string;
    created_at: string;
    is_approved: boolean;
    content: {
        title: string;
        slug: string;
    };
}

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch("/api/admin/reviews");
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as avaliações.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const response = await fetch(`/api/admin/reviews/${id}/approve`, {
                method: "PUT"
            });

            if (response.ok) {
                toast({
                    title: "Sucesso!",
                    description: "Avaliação aprovada com sucesso.",
                });
                fetchReviews();
            }
        } catch (error) {
            console.error("Erro ao aprovar avaliação:", error);
            toast({
                title: "Erro",
                description: "Não foi possível aprovar a avaliação.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta avaliação?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/reviews/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                toast({
                    title: "Sucesso!",
                    description: "Avaliação excluída com sucesso.",
                });
                fetchReviews();
            }
        } catch (error) {
            console.error("Erro ao excluir avaliação:", error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir a avaliação.",
                variant: "destructive"
            });
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star 
                    key={i} 
                    className={`w-4 h-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                />
            );
        }
        return stars;
    };

    if (loading) {
        return <div className="p-6">Carregando...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Gerenciar Avaliações</h1>

            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="font-medium">{review.user_name}</span>
                                    <span className="text-sm text-gray-500 ml-2">({review.user_email})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!review.is_approved && (
                                        <Button
                                            onClick={() => handleApprove(review.id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Aprovar
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => handleDelete(review.id)}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        Excluir
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                    {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-2">{review.comment}</p>

                            <div className="text-sm text-gray-500">
                                Conteúdo: {review.content.title}
                            </div>

                            {!review.is_approved && (
                                <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                    Aguardando aprovação
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Nenhuma avaliação encontrada.</p>
                )}
            </div>
        </div>
    );
} 