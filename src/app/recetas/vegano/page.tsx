"use client";

import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Path } from "@/components/breadcrumb/path";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { CarouselImages } from "@/components/shared/carousel-images";
import vegan from "@/assets/images/vegan.webp";
import veganSalad from "@/assets/images/veganSalad.webp";
import veganBurger from "@/assets/images/veganBurger.webp";
import veganSalad2 from "@/assets/images/veganSalad2.webp";
import veganSalad3 from "@/assets/images/veganSalad3.webp";
import { experimental_useObject as useObject } from "ai/react";
import { notificationSchema } from "@/app/api/recipe/description/schema";
import { Fragment } from "react";

const placeholder =
	"Hoy me gustaría comer una hamburguesa vegana, pero no se me ocurre ninguna receta, ¿me puedes ayudar?";

const images = [
	{
		src: vegan,
		alt: "Ensalada vegana",
	},
	{
		src: veganSalad,
		alt: "Ensalada vegana",
	},
	{
		src: veganBurger,
		alt: "Hamburguesa vegana",
	},
	{
		src: veganSalad2,
		alt: "Ensalada vegana",
	},
	{
		src: veganSalad3,
		alt: "Ensalada vegana",
	},
];

const formSchema = z.object({
	message: z.string().min(5, { message: "Input is required" }),
});

export default function VeganPage() {
	const router = useRouter();
	const { messages, input, handleInputChange, handleSubmit, error, isLoading } =
		useChat({
			api: "/api/recipe/vegan",
			onFinish: () => {
				router.refresh();
			},
		});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			message: "",
		},
	});

	useEffect(() => {
		if (error) {
			toast.error(error.message);
		}
	}, [error]);

	const { object, submit } = useObject({
		api: "/api/recipe/description",
		schema: notificationSchema,
	});

	return (
		<main className="max-w-6xl px-4 md:my-14 space-y-6 mx-auto">
			<Path name="Vegano" />
			<CarouselImages images={images} />
			<Button
				variant={"outline"}
				onClick={() => submit("Breve descripcion de las comidas veganas")}
				disabled={isLoading}
			>
				Generar descripción
			</Button>
			<div className="px-4 py-2">
				{object?.notifications?.map((notification, index) => (
					<Fragment key={index}>
						<ReactMarkdown
							components={{
								pre: ({ node, ...props }) => (
									<div className="overflow-auto w-full my-2">
										<pre {...props} />
									</div>
								),
								code: ({ node, ...props }) => <code {...props} />,
								strong: ({ node, ...props }) => (
									<strong className="font-medium text-sm" {...props} />
								),
							}}
							className="text-sm overflow-hidden leading-7 font-light"
						>
							{notification?.message || ""}
						</ReactMarkdown>
					</Fragment>
				))}
			</div>
			<div className="flex flex-col gap-4">
				<Form {...form}>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<FormField
							name="message"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											placeholder={placeholder}
											value={input}
											onChange={handleInputChange}
											required
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							disabled={isLoading}
							type="submit"
							className="bg-[#FF9737] hover:bg-[#FFBC7E]"
						>
							Generar receta
						</Button>
					</form>
				</Form>
				<div className="flex flex-col-reverse">
					{messages.map((message) => (
						<ReactMarkdown
							key={message.id}
							className="font-light text-sm"
							components={{
								p: ({ node, ...props }) => (
									<p className="my-2 text-pretty leading-6" {...props} />
								),
								strong: ({ node, ...props }) => (
									<strong className="font-medium text-sm" {...props} />
								),
								ul: ({ node, ...props }) => (
									<ul className="list-disc list-inside" {...props} />
								),
								h3: ({ node, ...props }) => (
									<h3 className="text-lg font-semibold my-2" {...props} />
								),
								h4: ({ node, ...props }) => (
									<h3 className="font-semibold my-2" {...props} />
								),
								li: ({ node, ...props }) => <li className="py-1" {...props} />,
								ol: ({ node, ...props }) => (
									<ol className="list-decimal mx-4" start={1} {...props} />
								),
							}}
						>
							{message.content || ""}
						</ReactMarkdown>
					))}
				</div>
			</div>
		</main>
	);
}
