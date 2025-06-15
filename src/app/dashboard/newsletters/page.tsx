import { Metadata } from 'next'
import { NewsletterClient } from './client'

export const metadata: Metadata = {
    title: 'Newsletter Management | KNUST SRC',
    description: 'Manage and send newsletters to subscribers',
}

export default function NewsletterPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Newsletter Management</h1>
            </div>
            <NewsletterClient />
        </div>
    )
} 