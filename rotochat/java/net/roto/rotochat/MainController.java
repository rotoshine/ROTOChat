package net.roto.rotochat;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * 메인 컨트롤러.
 * 대부분의 요청 처리는 이곳에서 함.
 * @author rotoshine
 *
 */
@Controller
public class MainController {
	private static final Logger logger = LoggerFactory.getLogger(MainController.class);
	
	/**
	 * Simply selects the home view to render by returning its name.
	 */
	@RequestMapping(value = {"", "/"} , method = RequestMethod.GET)
	public String home(HttpServletRequest request, Model model) {
		logger.info("request ip : " + request.getRemoteAddr() );
		return "chat";
	}
	
}
