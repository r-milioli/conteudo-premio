import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Star, StarHalf } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

interface Review {
    id: number;
    comment: string;
    rating: number;
    user_name: string;
    created_at: string;
}

interface ReviewSectionProps {
    contentSlug: string | undefined;
}

export function ReviewSection({ contentSlug }: ReviewSectionProps) {
    const { settings } = useSiteSettings();
    const primaryColor = settings?.primaryColor || '#4361ee';
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: "",
        user_name: "",
        user_email: ""
    });

    useEffect(() => {
        if (contentSlug) {
            fetchReviews();
        }
    }, [contentSlug]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/public/contents/${contentSlug}/reviews`);
            const data = await response.json();
            
            if (response.ok) {
                setReviews(data.reviews);
                setAverageRating(data.averageRating);
                setTotalReviews(data.totalReviews);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`/api/public/contents/${contentSlug}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newReview)
            });

            if (response.ok) {
                toast({
                    title: "Sucesso!",
                    description: "Sua avaliação foi enviada e será revisada em breve.",
                });
                setNewReview({ rating: 0, comment: "", user_name: "", user_email: "" });
                setShowForm(false);
            } else {
                throw new Error("Erro ao enviar avaliação");
            }
        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            toast({
                title: "Erro",
                description: "Não foi possível enviar sua avaliação. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
            } else if (i - 0.5 <= rating) {
                stars.push(<StarHalf key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
            } else {
                stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
            }
        }
        return stars;
    };

    return (
        <div className="mt-8 space-y-6 bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Avaliações</h2>
                    <div className="flex items-center mt-2">
                        <div className="flex items-center">
                            {renderStars(averageRating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                            {averageRating.toFixed(1)} ({totalReviews} avaliações)
                        </span>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    variant="outline"
                >
                    {showForm ? "Cancelar" : "Avaliar"}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg mt-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Sua avaliação</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className="focus:outline-none"
                                >
                                    <Star 
                                        className={`w-6 h-6 ${
                                            star <= newReview.rating 
                                                ? "fill-yellow-400 text-yellow-400" 
                                                : "text-gray-300"
                                        }`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Seu nome</label>
                            <Input
                                value={newReview.user_name}
                                onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                                placeholder="Digite seu nome"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Seu email</label>
                            <Input
                                type="email"
                                value={newReview.user_email}
                                onChange={(e) => setNewReview({ ...newReview, user_email: e.target.value })}
                                placeholder="Digite seu email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Seu comentário</label>
                        <Textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Digite seu comentário"
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className={cn(
                            "transition-colors",
                            "hover:opacity-90"
                        )}
                        style={{ 
                            backgroundColor: primaryColor,
                            color: 'white'
                        }}
                    >
                        {submitting ? "Enviando..." : "Enviar avaliação"}
                    </Button>
                </form>
            )}

            <div className="space-y-6 mt-6">
                {loading ? (
                    <p>Carregando avaliações...</p>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="font-medium">{review.user_name}</span>
                                <div className="flex items-center">
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            <p className="mt-2 text-gray-600">{review.comment}</p>
                            <span className="text-sm text-gray-400 mt-1 block">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Ainda não há avaliações para este conteúdo.</p>
                )}
            </div>
        </div>
    );
} 