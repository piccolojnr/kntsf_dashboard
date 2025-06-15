import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface NewsletterEmailProps {
    name: string
    title: string
    content: string
}

export const generateNewsletterEmailTemplate = ({
    name,
    title,
    content,
}: NewsletterEmailProps) => ({
    text: `Hi ${name},\n\n${title}\n\n${content}\n\nBest regards,\nThe KNUST SRC Team`,
    html: (
        <Html>
            <Head />
            <Preview>{title}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>{title}</Heading>
                    <Text style={text}>
                        Hi {name},
                    </Text>
                    <Text style={text}>
                        {content}
                    </Text>
                    <Text style={footer}>
                        Best regards,<br />
                        The KNUST SRC Team
                    </Text>
                </Container>
            </Body>
        </Html>
    ),
})

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
}

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
    margin: '16px 0',
}

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '16px 0',
}

const footer = {
    color: '#898989',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '16px 0',
} 