import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'

const GoogleOAuthFailure = () => {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          to='/'
          className='flex items-center gap-2 self-center font-medium'
        >
          <Logo />
          تِلِ من
        </Link>
        <div className='flex flex-col gap-6'></div>
      </div>
      <Card>
        <CardContent>
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>احراز هویت ناموفق بود</h1>
            <p>ورود شما با حساب گوگل انجام نشد. لطفاً دوباره تلاش کنید.</p>

            <Button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
              بازگشت به صفحه ورود
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GoogleOAuthFailure
