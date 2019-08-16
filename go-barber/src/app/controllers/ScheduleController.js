const moment = require('moment')
const { Op } = require('sequelize')
const { Appointment, User } = require('../models')

class ScheduleController {
  async index (req, res) {
    const today = moment()
    const sessionUser = req.session.user

    var appointments = []

    if (sessionUser.provider) {
      appointments = await Appointment.findAll(
        {
          include: [{ model: User, as: 'user' }],
          where: {
            provider_id: sessionUser.id,
            date: {
              [Op.between]: [
                today.startOf('day').format(),
                today.endOf('day').format()
              ]
            }
          },
          order: [['date', 'ASC']]
        })
    } else {
      appointments = await Appointment.findAll(
        {
          include: [{ model: User, as: 'provider' }],
          where: {
            user_id: sessionUser.id,
            date: {
              [Op.between]: [
                today.startOf('day').format(),
                today.endOf('day').format()
              ]
            }
          },
          order: [['date', 'ASC']]
        })
    }

    const schedule = appointments.map(appointment => {
      const date = moment(appointment.date)

      return {
        hour: date.format('HH:mm'),
        user: appointment.user || appointment.provider,
        active: date.isAfter(moment())
      }
    })

    return res.render('schedule/index', { schedule })
  }
}

module.exports = new ScheduleController()
